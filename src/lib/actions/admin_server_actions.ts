'use server'

import { addNewIndividual, getAllIndividuals, updateIndividual } from "@/lib/_data_access/individuals";
import { redirect } from 'next/navigation'

// TODO add input validation
export async function addNewIndividualServerAction(rawFormData: FormData) {

    const modifiedFormData = {
        first_name: rawFormData.get('first_name_field') as string,
        parent_name: rawFormData.get('parent_name_field') as string,
        grandparent_name: rawFormData.get('grandparent_name_field') as string,
        last_name: rawFormData.get('last_name_field') as string,
        gender: rawFormData.get('gender_field') as string,
        is_dead: rawFormData.get('is_dead_field') as string,
    };
    const gender = modifiedFormData['gender']==='ذكر'? 'male' : modifiedFormData['gender']==='أنثى'? 'female' : 'unknown';
    modifiedFormData['gender'] = gender;
    const isDead = modifiedFormData['is_dead']==='حي'? 'alive': modifiedFormData['is_dead']==='متوفى'? 'dead' : 'unknown';
    modifiedFormData['is_dead'] = isDead;

    const result = await addNewIndividual(modifiedFormData);
    console.log('result: ', result);
    if (result) {
        redirect(`/admin/individuals`)
    }
}

export async function searchIndividualsServerAction(query: string) {
    return await getAllIndividuals(query || undefined);
}

export async function editIndividualServerAction(publicId: string, rawFormData: FormData) {
    const modifiedFormData = {
        first_name: rawFormData.get('first_name_field') as string,
        parent_name: rawFormData.get('parent_name_field') as string,
        grandparent_name: rawFormData.get('grandparent_name_field') as string,
        last_name: rawFormData.get('last_name_field') as string,
        gender: rawFormData.get('gender_field') as string,
        is_dead: rawFormData.get('is_dead_field') as string,
    };
    const gender = modifiedFormData['gender']==='ذكر'? 'male' : modifiedFormData['gender']==='أنثى'? 'female' : 'unknown';
    modifiedFormData['gender'] = gender;
    const isDead = modifiedFormData['is_dead']==='حي'? 'alive': modifiedFormData['is_dead']==='متوفى'? 'dead' : 'unknown';
    modifiedFormData['is_dead'] = isDead;

    const result = await updateIndividual(publicId, modifiedFormData);
    if (result) {
        redirect(`/admin/individuals`);
    }
}

