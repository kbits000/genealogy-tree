import "server-only";

import dbConnect from "@/lib/dbConnect";
import IndividualModel from "@/lib/database_models/individuals_model";
import mongoose from "mongoose";

type operationType = { operation : "add" | "get" | "update" | "delete"}

type updateReverseRelationshipsOptions = {
    targetIndividualId: mongoose.Document;
    sex: String;
    session: mongoose.ClientSession;
    motherId?: mongoose.Types.ObjectId;
    fatherId?: mongoose.Types.ObjectId;
    spousesIdsList?: {spouse_id: mongoose.Types.ObjectId; is_divorced?: String}[];
    childrenIdsList?: {child_id: mongoose.Types.ObjectId}[];
    operation?: "add" | "get" | "update" | "delete";
}

async function updateReverseRelationships({
    targetIndividualId,
    sex,
    session,
    motherId,
    fatherId,
    spousesIdsList,
    childrenIdsList,
    operation,
    }
    : updateReverseRelationshipsOptions
){

    try {

        if (operation == "delete" ) {
            if (motherId) {
                await IndividualModel.updateOne(
                    { _id: motherId },
                    { $pull: { children_ids: { child_id: targetIndividualId._id } } },
                    { session }
                );
            }
            if (fatherId) {
                await IndividualModel.updateOne(
                    { _id: fatherId },
                    { $pull: { children_ids: { child_id: targetIndividualId._id } } },
                    { session }
                );
            }
            // delete spouces
            for (var spouceId of spousesIdsList ?? []) {
                await IndividualModel.updateOne(
                    { _id: spouceId.spouse_id },
                    { $pull: { spouses_ids: { spouse_id: targetIndividualId._id } } },
                    { session }
                );
            }
            // delete children: clear whichever parent field points at targetIndividualId.
            // Checking the ID instead of the sex also works when the sex is "unknown".
            for (var childId of childrenIdsList ?? []) {
                await IndividualModel.updateOne(
                    { _id: childId.child_id, father_id: targetIndividualId._id },
                    { $unset: { father_id: 1 } },
                    { session }
                );
                await IndividualModel.updateOne(
                    { _id: childId.child_id, mother_id: targetIndividualId._id },
                    { $unset: { mother_id: 1 } },
                    { session }
                );
            }
            return true;
        }

        // The IDs passed in here were already checked to exist by the caller (resolvePublicId
        // throws when an ID isn't found), so there's no matchedCount check below.
        // The { $ne: ... } filter skips the push when the item is already in the list.
        if (motherId) {
            await IndividualModel.updateOne(
                { _id: motherId, "children_ids.child_id": { $ne: targetIndividualId._id } },
                { $push: { children_ids: { child_id: targetIndividualId._id } } },
                { session }
            );
        }

        if (fatherId) {
            await IndividualModel.updateOne(
                { _id: fatherId, "children_ids.child_id": { $ne: targetIndividualId._id } },
                { $push: { children_ids: { child_id: targetIndividualId._id } } },
                { session }
            );
        }

        for (var spouceId of spousesIdsList ?? []) {
            await IndividualModel.updateOne(
                { _id: spouceId.spouse_id, "spouses_ids.spouse_id": { $ne: targetIndividualId._id } },
                { $push: { spouses_ids: { spouse_id: targetIndividualId._id, is_divorced: spouceId.is_divorced ?? "unknown" } } },
                { session }
            );
        }

        for (var childId of childrenIdsList ?? []) {
            if (sex == "male") {
                await IndividualModel.updateOne(
                    { _id: childId.child_id },
                    { $set: { father_id: targetIndividualId._id } },
                    { session }
                );
            } else if (sex == "female") {
                await IndividualModel.updateOne(
                    { _id: childId.child_id },
                    { $set: { mother_id: targetIndividualId._id } },
                    { session }
                );
            } else {
                // Unknown sex: put targetIndividualId in whichever parent slot of the child is empty
                const childDocument = await IndividualModel.findOne({ _id: childId.child_id }).select('father_id mother_id').session(session).lean();
                if (!childDocument) {
                    throw new Error(`Child not found: ${childId.child_id}`);
                }

                const isAlreadyParent = childDocument.father_id?.equals(targetIndividualId._id)
                    || childDocument.mother_id?.equals(targetIndividualId._id);

                if (isAlreadyParent) {
                    // nothing to do (happens when an existing child is kept during an update)
                } else if (!childDocument.father_id) {
                    await IndividualModel.updateOne(
                        { _id: childId.child_id },
                        { $set: { father_id: targetIndividualId._id } },
                        { session }
                    );
                } else if (!childDocument.mother_id) {
                    await IndividualModel.updateOne(
                        { _id: childId.child_id },
                        { $set: { mother_id: targetIndividualId._id } },
                        { session }
                    );
                } else {
                    throw new Error(`Child ${childId.child_id} already has both a father and a mother`);   // rolls back the transaction
                }
            }
        }
        return true;
    } catch (e) {
        throw e;
    }
}

async function resolvePublicId(publicId: string, session?: mongoose.ClientSession) {
    // console.log('resolvePublicId: ', publicId);
    if (!publicId) return null;
    const doc = await IndividualModel.findOne({ public_id: publicId }).select('_id').session(session ?? null).lean();
    if (!doc) {
        throw new Error(`Individual not found: ${publicId}`);   // rolls back the transaction
    }
    return doc._id;
}

function relatedShape(doc: { public_id: unknown; first_name: string; parent_name?: string }) {
    return {
        public_id: String(doc.public_id),
        first_name: doc.first_name,
        parent_name: doc.parent_name,
    };
}

// TODO reflect updates in other individuals' documents
// TODO add input validation
export async function addNewIndividualNoACID(modifiedFormData: {
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    gender: string;
    is_dead: string;
    mother_id?: string;
    father_id?: string;
    spouses_ids?: { public_id: string; is_divorced: string }[];
    siblings_ids?: { public_id: string; relationshipSide?: string }[];
    grandmothers_ids?: { public_id: string; relationshipSide?: string }[];
    grandfathers_ids?: { public_id: string; relationshipSide?: string }[];
    children_ids?: { public_id: string; is_dead?: string }[];
    individuals_ids?: { public_id: string; relationshipSide?: string; is_dead?: string; sex: string; additional_information?: string }[];
}) {
    if (modifiedFormData['first_name']===null || modifiedFormData['first_name']===undefined || modifiedFormData['first_name']===''
        || modifiedFormData['gender']===null || modifiedFormData['gender']===undefined || modifiedFormData['gender']===''
        || modifiedFormData['is_dead']===null || modifiedFormData['is_dead']===undefined || modifiedFormData['is_dead']==='') {
        return false;
    }

    try {
        await dbConnect();
        const settledResults = await Promise.allSettled([
            modifiedFormData.mother_id ? resolvePublicId(modifiedFormData.mother_id) : Promise.resolve(null),
            modifiedFormData.father_id ? resolvePublicId(modifiedFormData.father_id) : Promise.resolve(null),
            Promise.all((modifiedFormData.spouses_ids ?? []).map(async s => {
                return {
                    spouse_id: await resolvePublicId(s.public_id),
                    // is_divorced: s.is_divorced ?? 'unknown',
                    spouse_public_id: s.public_id,
                }
            })),
            Promise.all((modifiedFormData.siblings_ids ?? []).map(async s => {
                return {
                    sibling_id: await resolvePublicId(s.public_id),
                    relationshipSide: s.relationshipSide ?? 'unknown',
                    sibling_public_id: s.public_id,
                }
            })),
            Promise.all((modifiedFormData.grandmothers_ids ?? []).map(async s => {
                return {
                    grandmother_id: await resolvePublicId(s.public_id),
                    relationshipSide: s.relationshipSide ?? 'unknown',
                    grandmother_public_id: s.public_id,
                }
            })),
            Promise.all((modifiedFormData.grandfathers_ids ?? []).map(async s => {
                return {
                    grandfather_id: await resolvePublicId(s.public_id),
                    relationshipSide: s.relationshipSide ?? 'unknown',
                    grandfather_public_id: s.public_id,
                }
            })),
            Promise.all((modifiedFormData.individuals_ids ?? []).map(async e => ({
                individual_id: await resolvePublicId(e.public_id),
                relationshipSide: e.relationshipSide ?? 'unknown',
                individual_public_id: e.public_id
            }))),
        ]);


        const motherId = settledResults[0].status === 'fulfilled' ? settledResults[0].value : null;
        const fatherId = settledResults[1].status === 'fulfilled' ? settledResults[1].value : null;
        const spousesIds =settledResults[2].status === 'fulfilled' ? settledResults[2].value : [];
        const siblingsIds =settledResults[3].status === 'fulfilled' ? settledResults[3].value : [];
        const grandmothersIds =settledResults[4].status === 'fulfilled' ? settledResults[4].value : [];
        const grandfathersIds =settledResults[5].status === 'fulfilled' ? settledResults[5].value : [];
        const indIds =settledResults[6].status === 'fulfilled' ? settledResults[6].value : [];

        const newIndividual = new IndividualModel({
            first_name: modifiedFormData['first_name'],
            parent_name: modifiedFormData['parent_name'],
            grandparent_name: modifiedFormData['grandparent_name'],
            last_name: modifiedFormData['last_name'],
            sex: modifiedFormData['gender'],
            is_dead: modifiedFormData['is_dead'],
            mother_id: motherId,
            father_id: fatherId,
            spouses_ids: spousesIds.filter(Boolean),   // new
            siblings_ids: siblingsIds.filter(Boolean),
            grandmothers_ids: grandmothersIds.filter(Boolean),      // TODO fix setting nested fields
            grandfathers_ids: grandfathersIds.filter(Boolean),      // TODO fix setting nested fields
            individuals_ids: indIds.filter(e => e.individual_id),       // TODO fix error/warning
        });
        console.log('newIndividual is: ', newIndividual, " of type: ", typeof(newIndividual))
        console.log('newIndividual_id is: ', newIndividual._id, " of type: ", typeof(newIndividual._id))
        console.log('siblingsIds is: ', siblingsIds, " of type: ", typeof(siblingsIds))

        const savesSuccessfully = await newIndividual.save();
        return savesSuccessfully===newIndividual;
    } catch {

    }
}
 
//-------------------------------------------------------------START----------------------------------------------------------------------------
// TODO reflect updates in other individuals' documents
// TODO add input validation
// NEW with transaction
export async function addNewIndividual(modifiedFormData: {
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    gender: string;
    is_dead: string;
    mother_id?: string;
    father_id?: string;
    spouses_ids?: { public_id: string; is_divorced: string }[];
    siblings_ids?: { public_id: string; relationshipSide?: string }[];
    grandmothers_ids?: { public_id: string; relationshipSide?: string }[];
    grandfathers_ids?: { public_id: string; relationshipSide?: string }[];
    children_ids?: { public_id: string; is_dead?: string }[];
    individuals_ids?: { public_id: string; relationshipSide?: string; is_dead?: string; sex: string; additional_information?: string }[];
}) {

    if (modifiedFormData['first_name']===null || modifiedFormData['first_name']===undefined || modifiedFormData['first_name']===''
        || modifiedFormData['gender']===null || modifiedFormData['gender']===undefined || modifiedFormData['gender']===''
        || modifiedFormData['is_dead']===null || modifiedFormData['is_dead']===undefined || modifiedFormData['is_dead']==='') {
        return false;
    }
    
    try {
        const mongooseInstance = await dbConnect();
        // TODO not sure about the await
        return await mongooseInstance.connection.transaction(async function createNewIndividual(session: mongoose.ClientSession) {
            // resolvePublicId throws when an ID isn't found, which rolls back the transaction
            const motherId = modifiedFormData.mother_id ? await resolvePublicId(modifiedFormData.mother_id, session) : null;
            const fatherId = modifiedFormData.father_id ? await resolvePublicId(modifiedFormData.father_id, session) : null;

            var spousesIdsList: { spouse_id: mongoose.Types.ObjectId; is_divorced?: String}[] = []
            for (var spouseStringId of modifiedFormData.spouses_ids?? []) {
                spousesIdsList.push({
                    spouse_id: await resolvePublicId(spouseStringId.public_id, session),
                    is_divorced: spouseStringId.is_divorced
                })
            }
            console.log('spousesIdsList: ', spousesIdsList)

            var siblingsIdsList = [];
            for (var siblingsStringId of modifiedFormData.siblings_ids?? []) {
                siblingsIdsList.push({
                    sibling_id: await resolvePublicId(siblingsStringId.public_id, session)
                })
            }

            var grandmothersIdsList = [];
            for (var grandmotherStringId of modifiedFormData.grandmothers_ids ?? []) {
                grandmothersIdsList.push({
                    grandmother_id: await resolvePublicId(grandmotherStringId.public_id, session)
                })
            }

            var grandfatherIdsList = [];
            for (var grandfatherStringId of modifiedFormData.grandfathers_ids ?? []) {
                grandfatherIdsList.push({
                    grandfather_id: await resolvePublicId(grandfatherStringId.public_id, session)
                })
            }

            var childrenIdsList: {child_id: mongoose.Types.ObjectId}[] = [];
            for (var childStringID of modifiedFormData.children_ids ?? []) {
                childrenIdsList.push({
                    child_id: await resolvePublicId(childStringID.public_id, session)
                })
            }

            var individualsIdsList = [];
            for (var individualStringID of modifiedFormData.individuals_ids ?? []) {
                individualsIdsList.push({
                    individual_id: await resolvePublicId(individualStringID.public_id, session)
                })
            }

            const newIndividual = new IndividualModel({
                first_name: modifiedFormData['first_name'],
                parent_name: modifiedFormData['parent_name'],
                grandparent_name: modifiedFormData['grandparent_name'],
                last_name: modifiedFormData['last_name'],
                sex: modifiedFormData['gender'],
                is_dead: modifiedFormData['is_dead'],
                mother_id: motherId,
                father_id: fatherId,
                spouses_ids: spousesIdsList.filter(Boolean),   // new
                siblings_ids: siblingsIdsList.filter(Boolean),
                grandmothers_ids: grandmothersIdsList.filter(Boolean),      // TODO fix setting nested fields
                grandfathers_ids: grandfatherIdsList.filter(Boolean),      // TODO fix setting nested fields
                children_ids: childrenIdsList.filter(Boolean),
                // individuals_ids: individualsIds.filter(s => s.individual_id),       // TODO fix error/warning
                individuals_ids: individualsIdsList.filter(Boolean),       // TODO fix error/warning
            });
            
            const savedNewIndividualSuccessfully = await newIndividual.save({ session });
            console.log('treuuuuuuuu')

            if (savedNewIndividualSuccessfully != newIndividual) {
                throw new Error('An unexpected error occurred!');
            }

            //check if needed before calling
            const updated = await updateReverseRelationships({
                targetIndividualId: newIndividual,
                sex: modifiedFormData['gender'],
                session: session,
                motherId: motherId,
                fatherId: fatherId,
                spousesIdsList: spousesIdsList,
                childrenIdsList: childrenIdsList
            })

            if (updated != true) {
                throw new Error("error"); // TODO What should I throw?
            }
            return true;
            //check if needed
            // await updateReverseRelationships(newIndividual, { motherId, fatherId}, session)

        })
    } catch (e) {
        console.log('Error is: ', e)
        return false;
    }
}


//------------------------------------------------------------------END-----------------------------------------------------------------------------


export function getSpouseCandidateSexes(subjectSex: string): ('male' | 'female' | 'unknown')[] {
    if (subjectSex === 'male') return ['female', 'unknown'];
    if (subjectSex === 'female') return ['male', 'unknown'];
    return ['male', 'female', 'unknown'];
}

export async function getAllIndividuals(
    query?: string,
    options?: { sexes?: string[]; excludePublicId?: string },
) {
    try {
        await dbConnect();
        const filter: Record<string, unknown> = {};
        if (query) {
            filter.$or = [
                { first_name: { $regex: query, $options: 'i' } },
                { parent_name: { $regex: query, $options: 'i' } },
                { grandparent_name: { $regex: query, $options: 'i' } },
                { last_name: { $regex: query, $options: 'i' } },
            ];
        }
        if (options?.sexes?.length) {
            filter.sex = { $in: options.sexes };
        }
        if (options?.excludePublicId) {
            filter.public_id = { $ne: options.excludePublicId };
        }
        const individuals = await IndividualModel.find(filter).select('public_id first_name parent_name grandparent_name last_name sex ').lean();    // TODO remove is_dead
        return individuals.map(ind => ({
            public_id: String(ind.public_id),
            first_name: ind.first_name,
            parent_name: ind.parent_name,
            grandparent_name: ind.grandparent_name,
            last_name: ind.last_name,
            sex: ind.sex,
            // is_dead: ind.is_dead,
        }));
    } catch {
        return [];
    }
}

// TODO make it return relationshipSide of grandfathers and grandmothers.
export async function getIndividualByPublicId(publicId: string) {       // TODO add query selection
    try {
        await dbConnect();
        const individual = await IndividualModel.findOne({ public_id: publicId}).lean();

        if (!individual) return null;
        console.log('individual: ', individual);

        const settledResults = await Promise.allSettled([
            individual.mother_id ? resolvePublicId(individual.mother_id) : Promise.resolve(null),
            individual.father_id ? resolvePublicId(individual.father_id) : Promise.resolve(null),
            Promise.all((individual.spouses_ids ?? []).map(s => resolvePublicId(s.spouse_public_id))),
            Promise.all((individual.siblings_ids ?? []).map(s => resolvePublicId(s.sibling_public_id))),
            Promise.all((individual.grandmothers_ids ?? []).map(s => resolvePublicId(s.grandmother_public_id))),
            Promise.all((individual.grandfathers_ids ?? []).map(s => resolvePublicId(s.grandfather_public_id))),
        ]);

        const motherId = settledResults[0].status === 'fulfilled' ? settledResults[0].value : null;
        const fatherId = settledResults[1].status === 'fulfilled' ? settledResults[1].value : null;
        const spousesIds =settledResults[2].status === 'fulfilled' ? settledResults[2].value : [];
        const siblingsIds =settledResults[3].status === 'fulfilled' ? settledResults[3].value : [];
        const grandmothersIds =settledResults[4].status === 'fulfilled' ? settledResults[4].value : [];
        const grandfathersIds =settledResults[5].status === 'fulfilled' ? settledResults[5].value : [];

        const grandmothersIds_public_id_fullName_relationshipSide = await Promise.all(individual.grandmothers_ids.map(async (g) => {
            const individualFullNameObject = await IndividualModel.findOne({ _id: g.grandmother_id }).select(' first_name parent_name grandparent_name last_name -_id').lean();
            const fullName = [individualFullNameObject.first_name, individualFullNameObject.parent_name, individualFullNameObject.grandparent_name, individualFullNameObject.last_name].filter(Boolean).join(' ');
            return {
                public_id: String(g.grandmother_public_id),
                fullName: fullName,
                relationshipSide: g.relationshipSide ?? 'unknown',
            }
        }))
        console.log('grandmothersIds_public_id_fullName_relationshipSide: ', grandmothersIds_public_id_fullName_relationshipSide);
        
        const grandfathersIds_public_id_fullName_relationshipSide = await Promise.all(individual.grandfathers_ids.map(async (g) => {
            const individualFullNameObject = await IndividualModel.findOne({ _id: g.grandfather_id }).select(' first_name parent_name grandparent_name last_name -_id').lean();
            const fullName = [individualFullNameObject.first_name, individualFullNameObject.parent_name, individualFullNameObject.grandparent_name, individualFullNameObject.last_name].filter(Boolean).join(' ');
            return {
                public_id: String(g.grandfather_public_id),
                fullName: fullName,
                relationshipSide: g.relationshipSide ?? 'unknown',
            }
        }))

        const siblings_public_id_fullName_relationshipSide = await Promise.all(individual.siblings_ids.map(async (g) => {
            const siblingFullNameObject = await IndividualModel.findOne({ _id: g.sibling_id }).select(' first_name parent_name grandparent_name last_name -_id').lean();
            const fullName = [siblingFullNameObject.first_name, siblingFullNameObject.parent_name, siblingFullNameObject.grandparent_name, siblingFullNameObject.last_name].filter(Boolean).join(' ');
            return {
                public_id: String(g.sibling_public_id),
                fullName: fullName,
                relationshipSide: g.relationshipSide ?? 'unknown',
            }
        }))

        const individuals_ids_public_id_fullName_relationshipSide = await Promise.all(individual.individuals_ids.map(async (i) => {
            const individualFullNameObject = await IndividualModel.findOne({ _id: i.individual_id }).select(' first_name parent_name grandparent_name last_name -_id').lean();
            const fullName = [individualFullNameObject.first_name, individualFullNameObject.parent_name, individualFullNameObject.grandparent_name, individualFullNameObject.last_name].filter(Boolean).join(' ');
            return {
                public_id: String(i.individual_public_id),
                fullName: fullName,
            }
        }))
        console.log('individuals_ids_public_id_fullName_relationshipSide: ', individuals_ids_public_id_fullName_relationshipSide);

        return {
            public_id: String(individual.public_id),
            first_name: individual.first_name,
            parent_name: individual.parent_name ?? '',
            grandparent_name: individual.grandparent_name ?? '',
            last_name: individual.last_name ?? '',
            sex: individual.sex,
            is_dead: individual.is_dead,
            mother_id: individual.mother_id ? relatedShape(individual.mother_id) : undefined,     // TODO fix relatedShape AND it should be mother name and public id only
            father_id: individual.father_id ? relatedShape(individual.father_id) : undefined,     // TODO fix relatedShape AND it should be father name and public id only
            siblings_ids: siblings_public_id_fullName_relationshipSide,     // TODO fix relatedShape AND it should be sibling name and public id only
            spouses_ids: (individual.spouses_ids ?? []).map(relatedShape),     // TODO fix relatedShape AND it should be spouse name and public id only
            grandmothers_ids: grandmothersIds_public_id_fullName_relationshipSide,     // TODO fix relatedShape AND it should be grandmother name and public id only
            grandfathers_ids: grandfathersIds_public_id_fullName_relationshipSide,     // TODO fix relatedShape AND it should be grandfather name and public id only
            individuals_ids: individuals_ids_public_id_fullName_relationshipSide,     // TODO fix relatedShape AND it should be individual name and public id only
        };
    } catch {
        return null;
    }
}

// TODO reflect updates in other individuals' documents
export async function updateIndividual(publicId: string, data: {        // TODO data? ModifiedFormData
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    gender: string;
    is_dead: string;
    mother_id?: string;
    father_id?: string;
    spouses_ids?: { public_id: string; is_divorced: string }[];
    siblings_ids?: { public_id: string; sibling_side: string }[];
    grandmothers_id?: { public_id: string; mother_of: string }[];
    grandfathers_id?: { public_id: string; father_of: string }[];
    children_ids?: { public_id: string; }[];
    individuals_ids?: { public_id?: string; relationship?: string; is_dead?: string; sex: string; additional_information?: string }[];
}) {
    try {
        await dbConnect();
        const individual = await IndividualModel.findOne({ public_id: publicId });
        if (!individual) return false;

        //              START
        const settledResults = await Promise.allSettled([
            data.mother_id ? resolvePublicId(data.mother_id) : Promise.resolve(null),
            data.father_id ? resolvePublicId(data.father_id) : Promise.resolve(null),
            Promise.all((data.spouses_ids ?? []).map(s => resolvePublicId(s.public_id))),
            Promise.all((data.siblings_ids ?? []).map(s => resolvePublicId(s.public_id))),
            Promise.all((data.grandmothers_id ?? []).map(async s => {
                const resolvedId = await resolvePublicId(s.public_id);
                return {
                    grandmother_id: resolvedId,
                    mother_of: s.mother_of
                }
            })),
            Promise.all((data.grandfathers_id ?? []).map(async s => {
                const resolvedId = await resolvePublicId(s.public_id);
                return {
                    grandfather_id: resolvedId,
                    father_of: s.father_of
                }
            })),
            Promise.all((data.individuals_ids ?? []).map(async e => ({
                individual_id: e.public_id ? await resolvePublicId(e.public_id) : null,
                relationship: e.relationship,
            }))),
        ]);


        const motherId = settledResults[0].status === 'fulfilled' ? settledResults[0].value : null;
        const fatherId = settledResults[1].status === 'fulfilled' ? settledResults[1].value : null;
        const spousesIds =settledResults[2].status === 'fulfilled' ? settledResults[2].value : [];
        const siblingsIds =settledResults[3].status === 'fulfilled' ? settledResults[3].value : [];
        const grandmothersIds =settledResults[4].status === 'fulfilled' ? settledResults[4].value : [];
        const grandfathersIds =settledResults[5].status === 'fulfilled' ? settledResults[5].value : [];
        const indIds =settledResults[6].status === 'fulfilled' ? settledResults[6].value : [];

        //              END

        individual.first_name = data.first_name;
        individual.parent_name = data.parent_name;
        individual.grandparent_name = data.grandparent_name;
        individual.last_name = data.last_name;
        individual.sex = data.gender;
        individual.is_dead = data.is_dead;
        individual.mother_id = motherId;
        individual.father_id = fatherId;
        individual.spouses_ids = spousesIds.filter(Boolean);
        individual.siblings_ids = siblingsIds.filter(Boolean);
        individual.grandmothers_ids = grandmothersIds.filter(Boolean);
        individual.grandfathers_ids = grandfathersIds.filter(Boolean);
        individual.individuals_ids = indIds.filter(e => e.individual_id);

        const result = await individual.save();
        return result === individual;
    } catch {
        return false;
    }
}


//----------------------------------------------------START-----------------------------------------------------------------
// TODO reflect updates in other individuals' documents
// Add children
export async function updateIndividualWithTransaction(publicId: string, data: {        // TODO data? ModifiedFormData
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    gender: string;
    is_dead: string;
    mother_id?: string;
    father_id?: string;
    spouses_ids?: { public_id: string; is_divorced: string }[];
    siblings_ids?: { public_id: string; sibling_side: string }[];
    grandmothers_id?: { public_id: string; mother_of: string }[];
    grandfathers_id?: { public_id: string; father_of: string }[];
    children_ids?: { public_id: string; }[];
    individuals_ids?: { public_id?: string; relationship?: string; is_dead?: string; sex: string; additional_information?: string }[];
}) {
    // check if there is even data passed or not before entering try/catch

    try {
        const mongooseInstance = await dbConnect();

        return await mongooseInstance.connection.transaction(async function (session: mongoose.ClientSession) {
            const individual = await IndividualModel.findOne({ public_id: publicId }).session(session);
            if (!individual) return false;

            const motherId = data.mother_id ? await resolvePublicId(data.mother_id, session) : null;
            const fatherId = data.father_id ? await resolvePublicId(data.father_id, session) : null;

            var spousesIdsList = [];
            for (var spouseStringId of data.spouses_ids ?? []) {
                const resolveResult = await resolvePublicId(spouseStringId.public_id, session);
                spousesIdsList.push({spouse_id: resolveResult, is_divorced: spouseStringId.is_divorced});
            }

            var childrenIdsList = [];
            for (var childStringId of data.children_ids ?? []) {
                const resolveResult = await resolvePublicId(childStringId.public_id, session);
                childrenIdsList.push({child_id: resolveResult})
            }

            // Remove the old links first, so a changed mother/father/spouse/child doesn't keep
            // pointing at this individual. updateReverseRelationships further down adds the current ones.
            // This has to run before individual.mother_id etc. are overwritten below.
            var removedChildrenList = [];
            for (var oldChild of individual.children_ids) {
                var isStillChild = childrenIdsList.some(c => c.child_id.equals(oldChild.child_id));
                if (!isStillChild) {
                    removedChildrenList.push({ child_id: oldChild.child_id });
                }
            }

            await updateReverseRelationships({
                targetIndividualId: individual,
                sex: individual.sex,
                session: session,
                // only remove the old mother/father if they changed
                motherId: individual.mother_id?.equals(motherId) ? undefined : individual.mother_id,
                fatherId: individual.father_id?.equals(fatherId) ? undefined : individual.father_id,
                // remove all old spouses; the current ones are added back with their current is_divorced
                spousesIdsList: individual.spouses_ids,
                childrenIdsList: removedChildrenList,
                operation: "delete"
            });

            individual.first_name = data.first_name;
            individual.parent_name = data.parent_name;
            individual.grandparent_name = data.grandparent_name;
            individual.last_name = data.last_name;
            individual.sex = data.gender;
            individual.is_dead = data.is_dead;
            individual.mother_id = motherId;
            individual.father_id = fatherId;
            individual.spouses_ids = spousesIdsList.filter(Boolean);
            // individual.siblings_ids = siblingsIds.filter(Boolean);
            // individual.grandmothers_ids = grandmothersIds.filter(Boolean);
            // individual.grandfathers_ids = grandfathersIds.filter(Boolean);
            individual.children_ids = childrenIdsList.filter(Boolean);
            // individual.individuals_ids = indIds.filter(e => e.individual_id);
            const result = await individual.save({ session });
            if (result != individual) {
                return false;
            }

            const updated = await updateReverseRelationships({
                targetIndividualId: individual,
                sex: individual.sex,
                session: session,
                motherId: motherId,
                fatherId: fatherId,
                spousesIdsList: spousesIdsList,
                childrenIdsList: childrenIdsList
            })

            if (updated != true) {
                throw new Error("error");  // TODO What should I throw?
            }
            return true;
        })
        
    } catch {
        return false;
    }
}


//----------------------------------------------------END-------------------------------------------------------------------


export async function deleteIndividualWithNoTransaction(publicId: string) {
    try {
        await dbConnect();
        const result = await IndividualModel.deleteOne({public_id: publicId});
        return result.deletedCount === 1;
    } catch {
        return false;
    }
}

// TODO I have to make a seperate new function that reflectes on the deleted on an individual
export async function deleteIndividual(publicId: string) {
    try {
        const mongooseInstance = await dbConnect();

        const result = await mongooseInstance.connection.transaction(async function deleteIndividual(session: mongoose.ClientSession) {
            const individual = await IndividualModel.findOne({public_id: publicId}).session(session);
            const deleted = await IndividualModel.deleteOne({public_id: publicId}).session(session);

            if (deleted.deletedCount !== 1) {
                return false;
            }

            const updatedReverseRelationships = await updateReverseRelationships({
                targetIndividualId: individual,
                sex: individual.sex,
                session: session,
                motherId: individual.mother_id,
                fatherId: individual.father_id,
                spousesIdsList: individual.spouses_ids,
                childrenIdsList: individual.children_ids,
                operation: "delete"
            });

            return updatedReverseRelationships === true;
        });


        return result;
    } catch {
        return false;
    }
}

// TODO make it return relationshipSide of grandfathers and grandmothers.
export async function getIndividualDetails(publicId: string) {       // TODO addd query selection
    try {
        await dbConnect();
        const ind = await IndividualModel.findOne({ public_id: publicId })
            .select('public_id first_name parent_name grandparent_name last_name sex is_dead '
                + 'mother_id father_id wives_ids husbands_ids siblings_ids '
                + 'grandmothers_ids grandfathers_ids individuals_ids ')
            .populate('mother_id', 'public_id first_name parent_name')
            .populate('father_id', 'public_id first_name parent_name')
            // .populate('wives_ids', 'public_id first_name parent_name')
            // .populate('husbands_ids', 'public_id first_name parent_name')
            .populate('siblings_ids', 'public_id first_name parent_name')
            .populate('grandmothers_ids', 'public_id first_name parent_name')
            .populate('grandfathers_ids', 'public_id first_name parent_name')
            .populate('individuals_ids.individual_id', 'public_id first_name parent_name')
            .lean();
        if (!ind) return null;

        const i = ind as typeof ind & {
            mother_id?: { public_id: unknown; first_name: string; parent_name?: string } | null;
            father_id?: { public_id: unknown; first_name: string; parent_name?: string } | null;
            siblings_ids?: { public_id: unknown; first_name: string; parent_name?: string }[];
            grandmothers_ids?: { public_id: unknown; first_name: string; parent_name?: string }[];
            grandfathers_ids?: { public_id: unknown; first_name: string; parent_name?: string }[];
            individuals_ids?: { individual_id: { public_id: unknown; first_name: string; parent_name?: string } | null; relationship: string }[];
        };

        return {
            public_id: String(i.public_id),
            first_name: i.first_name,
            parent_name: i.parent_name,
            grandparent_name: i.grandparent_name,
            last_name: i.last_name,
            sex: i.sex,
            is_dead: i.is_dead,
            mother_id: i.mother_id ? relatedShape(i.mother_id) : undefined,
            father_id: i.father_id ? relatedShape(i.father_id) : undefined,
            siblings_ids:   (i.siblings_ids   ?? []).map(relatedShape),
            grandmothers_ids: (i.grandmothers_ids ?? []).map(relatedShape),
            grandfathers_ids: (i.grandfathers_ids ?? []).map(relatedShape),
            individuals_ids: (i.individuals_ids ?? [])
                .filter(e => e.individual_id)
                .map(e => ({ individual: relatedShape(e.individual_id!), relationship: e.relationship })),
        };
    } catch {
        return null;
    }
}

async function getIndividualFullNameByIdObject(publicId: string) {
    try {
        await dbConnect();
        const individual = await IndividualModel.findOne({ public_id: publicId }).select('first_name parent_name grandparent_name last_name').lean();
        if (!individual) return null;
        return [individual.first_name, individual.parent_name, individual.grandparent_name, individual.last_name].filter(Boolean).join(' ');
    } catch {
        return null;
    }
}