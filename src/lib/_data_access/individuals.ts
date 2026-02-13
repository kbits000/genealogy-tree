import "server-only";

import dbConnect from "@/lib/dbConnect";
import {redirect} from "next/navigation";
import IndividualModel from "@/lib/database_models/individuals_model";

// TODO add input validation
export async function addNewIndividual(modifiedFormData: FormData) {

    // const gender = modifiedFormData['gender']==='ذكر'? 'male' : modifiedFormData['gender']==='أنثى'? 'female' : 'unknown';

    try {
        await dbConnect();
        const newIndividual = new IndividualModel({
            first_name: modifiedFormData['first_name'],
            sex: modifiedFormData['gender'],
            is_dead: modifiedFormData['is_dead'],
        });

    } catch {

    }
}