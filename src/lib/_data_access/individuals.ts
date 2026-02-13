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
            sex: modifiedFormData['gender'],
            is_dead: modifiedFormData['is_dead'],
        });
        const savesSuccessfully = await newIndividual.save();
        return savesSuccessfully===newIndividual;
    } catch {

    }
}


export async function getAllIndividuals() {
    try {
        await dbConnect();
        const individuals = await IndividualModel.find({}).select('first_name parent_name grandparent_name last_name sex is_dead').lean();
        return individuals.map(ind => ({
            _id: String(ind._id),
            first_name: ind.first_name,
            sex: ind.sex,
            is_dead: ind.is_dead,
        }));
    } catch {

    }
}