import "server-only";

import dbConnect from "@/lib/dbConnect";
import IndividualModel from "@/lib/database_models/individuals_model";

async function resolvePublicId(publicId: string) {
    console.log('resolvePublicId: ', publicId);
    if (!publicId) return null;
    const doc = await IndividualModel.findOne({ public_id: publicId }).select('_id').lean();
    return doc._id ?? null;
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
    siblings_ids?: { public_id: string; sibling_side: string }[];
    grandmothers_id?: { public_id: string; mother_of: string }[];
    grandfathers_id?: { public_id: string; father_of: string }[];
    children_ids?: { public_id: string; is_dead?: string }[];
    individuals_ids?: { public_id: string; relationship?: string; is_dead?: string; sex: string; additional_information?: string }[];
}) {

    if (modifiedFormData['first_name']===null || modifiedFormData['first_name']===undefined || modifiedFormData['first_name']===''
        || modifiedFormData['gender']===null || modifiedFormData['gender']===undefined || modifiedFormData['gender']===''
        || modifiedFormData['is_dead']===null || modifiedFormData['is_dead']===undefined || modifiedFormData['is_dead']==='') {
        return false;
    }

    try {
        await dbConnect();
        console.log(modifiedFormData.siblings_ids)
        const settledResults = await Promise.allSettled([
            modifiedFormData.mother_id ? resolvePublicId(modifiedFormData.mother_id) : Promise.resolve(null),
            modifiedFormData.father_id ? resolvePublicId(modifiedFormData.father_id) : Promise.resolve(null),
            Promise.all((modifiedFormData.spouses_ids ?? []).map(s => resolvePublicId(s.public_id))),
            Promise.all((modifiedFormData.siblings_ids ?? []).map(s => resolvePublicId(s.public_id))),
            Promise.all((modifiedFormData.grandmothers_id ?? []).map(async s => {
                const resolvedId = await resolvePublicId(s.public_id);
                return {
                    grandmother_id: resolvedId,
                    mother_of: s.mother_of
                }
            })),
            Promise.all((modifiedFormData.grandfathers_id ?? []).map(async s => {
                const resolvedId = await resolvePublicId(s.public_id);
                return {
                    grandfather_id: resolvedId,
                    father_of: s.father_of
                }
            })),
            Promise.all((modifiedFormData.individuals_ids ?? []).map(async e => ({
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

        console.log('here: ', siblingsIds)
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
        const savesSuccessfully = await newIndividual.save();
        return savesSuccessfully===newIndividual;
    } catch {

    }
}


export async function getAllIndividuals(query?: string) {
    try {
        await dbConnect();
        const filter = query
            ? { $or: [
                    { first_name: { $regex: query, $options: 'i' } },
                    { parent_name: { $regex: query, $options: 'i' } },
                    { grandparent_name: { $regex: query, $options: 'i' } },
                    { last_name: { $regex: query, $options: 'i' } },
                ]}
            : {};
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
export async function getIndividualByPublicId(publicId: string) {       // TODO addd query selection
    try {
        await dbConnect();
        const individual = await IndividualModel.findOne({ public_id: publicId})
            .select('public_id first_name parent_name grandparent_name last_name sex is_dead'
                + 'mother_id father_id spouses_ids siblings_ids grandmothers_ids grandfathers_ids individuals_ids'
            )
            .populate('spouses_ids.spouse_id', 'public_id first_name parent_name last_name')
            .populate('siblings_ids.sibling_id', 'public_id first_name parent_name last_name')
            .populate('grandmothers_ids.grandmother_id', 'public_id first_name parent_name last_name')
            .populate('grandfathers_ids.grandfather_id', 'public_id first_name parent_name last_name')
            .populate('individuals_ids.individual_id', 'public_id first_name parent_name last_name')
            .lean();


        if (!individual) return null;

        const i = individual as typeof individual & {
            mother_id?: { public_id: unknown; first_name: string; parent_name?: string } | null;
            father_id?: { public_id: unknown; first_name: string; parent_name?: string } | null;
            siblings_ids?: { public_id: unknown; first_name: string; parent_name?: string }[];
            spouses_ids: { public_id: unknown; first_name: string; parent_name?: string }[];
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
            spouses_ids: (i.spouses_ids ?? []).map(relatedShape),
            grandmothers_ids: (i.grandmothers_ids ?? []).map(relatedShape),
            grandfathers_ids: (i.grandfathers_ids ?? []).map(relatedShape),
            individuals_ids: (i.individuals_ids ?? []).map(relatedShape),
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

        // const [motherId, fatherId, wivesIds, husbandsIds, siblingsIds, grandmothersIds, grandfathersIds, indIds] =
        //     await Promise.all([
        //         data.mother_id ? resolvePublicId(data.mother_id) : Promise.resolve(null),
        //         data.father_id ? resolvePublicId(data.father_id) : Promise.resolve(null),
        //         // Promise.all((data.wives_ids ?? []).map(resolvePublicId)),
        //         // Promise.all((data.husbands_ids ?? []).map(resolvePublicId)),
        //         Promise.all((data.siblings_ids ?? []).map(resolvePublicId)),
        //         Promise.all((data.grandmothers_ids ?? []).map(resolvePublicId)),
        //         Promise.all((data.grandfathers_ids ?? []).map(resolvePublicId)),
        //         Promise.all((data.individuals_ids ?? []).map(async e => ({
        //             individual_id: await resolvePublicId(e.public_id),
        //             relationship: e.relationship,
        //         }))),
        //     ]);


        // const settledResults = await Promise.allSettled([
        //     data.mother_id ? resolvePublicId(data.mother_id) : Promise.resolve(null),
        //     data.father_id ? resolvePublicId(data.father_id) : Promise.resolve(null),
        //     Promise.all((data.spouses_ids ?? [])),
        //     Promise.all((data.siblings_ids ?? [])),
        //     Promise.all((data.grandmothers_ids ?? [])),
        //     Promise.all((data.grandfathers_ids ?? [])),
        //     Promise.all((data.individuals_ids ?? []).map(async e => ({
        //         individual_id: e.public_id ?? null,
        //         relationship: e.relationship ?? null,
        //     }))),
        // ]);
        //
        // const getSettleValue = (result: any, fallback: any) =>
        //     result.status === 'fulfilled' ? result.value : fallback;
        //
        //
        // const motherId        = getSettleValue(settledResults[0], null);
        // const fatherId        = getSettleValue(settledResults[1], null);
        // const spousesIds      = getSettleValue(settledResults[2], []);
        // const siblingsIds     = getSettleValue(settledResults[3], []);
        // const grandmothersIds = getSettleValue(settledResults[4], []);
        // const grandfathersIds = getSettleValue(settledResults[5], []);
        // const indIds          = getSettleValue(settledResults[6], []);

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


export async function deleteIndividual(publicId: string) {
    try {
        await dbConnect();
        const result = await IndividualModel.deleteOne({public_id: publicId});
        return result.deletedCount === 1;
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
                + 'grandmothers_ids grandfathers_ids individuals_ids')
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
            // wives_ids?: { public_id: unknown; first_name: string; parent_name?: string }[];
            // husbands_ids?: { public_id: unknown; first_name: string; parent_name?: string }[];
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
            // wives_ids:      (i.wives_ids      ?? []).map(relatedShape),
            // husbands_ids:   (i.husbands_ids   ?? []).map(relatedShape),
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