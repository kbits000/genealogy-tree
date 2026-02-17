import "server-only";

import dbConnect from "@/lib/dbConnect";
import {redirect} from "next/navigation";
import IndividualModel from "@/lib/database_models/individuals_model";

// TODO add input validation
export async function addNewIndividual(modifiedFormData: {
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    gender: string;
    is_dead: string;
}) {

    // const gender = modifiedFormData['gender']==='ذكر'? 'male' : modifiedFormData['gender']==='أنثى'? 'female' : 'unknown';
    // Check if first_name, sex and is_dead are not null
    if (modifiedFormData['first_name']===null || modifiedFormData['first_name']===undefined || modifiedFormData['first_name']===''
    || modifiedFormData['gender']===null || modifiedFormData['gender']===undefined || modifiedFormData['gender']===''
    || modifiedFormData['is_dead']===null || modifiedFormData['is_dead']===undefined || modifiedFormData['is_dead']==='') {
        return false;
    }

    try {
        await dbConnect();
        const newIndividual = new IndividualModel({
            first_name: modifiedFormData['first_name'],
            parent_name: modifiedFormData['parent_name'],
            grandparent_name: modifiedFormData['grandparent_name'],
            last_name: modifiedFormData['last_name'],
            sex: modifiedFormData['gender'],
            is_dead: modifiedFormData['is_dead'],
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
        const individuals = await IndividualModel.find(filter).select('public_id first_name parent_name grandparent_name last_name sex is_dead').lean();
        return individuals.map(ind => ({
            public_id: String(ind.public_id),
            first_name: ind.first_name,
            parent_name: ind.parent_name,
            grandparent_name: ind.grandparent_name,
            last_name: ind.last_name,
            sex: ind.sex,
            is_dead: ind.is_dead,
        }));
    } catch {
        return [];
    }
}



export async function getIndividualByPublicId(publicId: string) {
    try {
        await dbConnect();
        const ind = await IndividualModel.findOne({ public_id: publicId }).select('public_id first_name parent_name grandparent_name last_name sex is_dead').lean();
        if (!ind) return null;
        return {
            public_id: String(ind.public_id),
            first_name: ind.first_name,
            parent_name: ind.parent_name,
            grandparent_name: ind.grandparent_name,
            last_name: ind.last_name,
            sex: ind.sex,
            is_dead: ind.is_dead,
        };
    } catch {
        return null;
    }
}


export async function updateIndividual(publicId: string, data: {
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    gender: string;
    is_dead: string;
}) {
    try {
        await dbConnect();
        const individual = await IndividualModel.findOne({ public_id: publicId });
        if (!individual) return false;

        individual.first_name = data.first_name;
        individual.parent_name = data.parent_name;
        individual.grandparent_name = data.grandparent_name;
        individual.last_name = data.last_name;
        individual.sex = data.gender;
        individual.is_dead = data.is_dead;

        await individual.save().then(savedDoc => {
            return savedDoc === individual;
        });
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