'use server'

import {addNewIndividual, deleteIndividual, getAllIndividuals, updateIndividual} from "@/lib/_data_access/individuals";
import {redirect} from 'next/navigation'
import {refresh} from 'next/cache'

const relationshipSideToEnglish: Record<string, string> = {
    'جهة الأب': 'father',
    'جهة الأم': 'mother',
    'غير معلوم': 'unknown',
};

// TODO add input validation
export async function addNewIndividualServerAction(rawFormData: FormData) {
    console.log(rawFormData.get('siblings_ids_field'));
    const modifiedFormData = {
        first_name: rawFormData.get('first_name_field') as string,
        parent_name: rawFormData.get('parent_name_field') as string,
        grandparent_name: rawFormData.get('grandparent_name_field') as string,
        last_name: rawFormData.get('last_name_field') as string,
        gender: rawFormData.get('gender_field') as string,
        is_dead: rawFormData.get('is_dead_field') as string,
        mother_id: rawFormData.get('mother_id_field') as string || undefined,
        father_id: rawFormData.get('father_id_field') as string || undefined,
        spouses_ids: JSON.parse(rawFormData.get('spouses_ids_field') as string || '[]'),
        siblings_ids: JSON.parse(rawFormData.get('siblings_ids_field') as string || '[]'),
        grandmothers_ids: JSON.parse(rawFormData.get('grandmothers_ids_field') as string || '[]'),
        grandfathers_ids: JSON.parse(rawFormData.get('grandfathers_ids_field') as string || '[]'),
        individuals_ids: JSON.parse(rawFormData.get('individuals_ids_field') as string || '[]'),
    };
    modifiedFormData['gender'] = modifiedFormData['gender'] === 'ذكر' ? 'male' : modifiedFormData['gender'] === 'أنثى' ? 'female' : 'unknown';
    modifiedFormData['is_dead'] = modifiedFormData['is_dead'] === 'حي' ? 'alive' : modifiedFormData['is_dead'] === 'متوفى' ? 'dead' : 'unknown';
    const grandmothers_ids_to_english = modifiedFormData['grandmothers_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
        return {...e, relationshipSide: relationshipSideToEnglish[e.relationshipSide]}
    }
    )
    modifiedFormData['grandmothers_ids'] = grandmothers_ids_to_english;

    const grandfathers_ids_to_english = modifiedFormData['grandfathers_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
            return {...e, relationshipSide: relationshipSideToEnglish[e.relationshipSide]}
        }
    )
    modifiedFormData['grandfathers_ids'] = grandfathers_ids_to_english;

    const result = await addNewIndividual(modifiedFormData);
    console.log('result: ', result);
    if (result) {
        redirect(`/admin/individuals`)
    }
}

export async function searchIndividualsServerAction(query: string) {
    return await getAllIndividuals(query || undefined);
}

// TODO redirect to details page
export async function editIndividualServerAction(publicId: string, rawFormData: FormData) {
    const modifiedFormData = {
        first_name: rawFormData.get('first_name_field') as string,
        parent_name: rawFormData.get('parent_name_field') as string,
        grandparent_name: rawFormData.get('grandparent_name_field') as string,
        last_name: rawFormData.get('last_name_field') as string,
        gender: rawFormData.get('gender_field') as string,
        is_dead: rawFormData.get('is_dead_field') as string,
        mother_id: rawFormData.get('mother_id_field') as string || undefined,
        father_id: rawFormData.get('father_id_field') as string || undefined,
        spouses_ids: JSON.parse(rawFormData.get('spouses_ids_field') as string || '[]'),
        siblings_ids: JSON.parse(rawFormData.get('siblings_ids_field') as string || '[]'),
        grandmothers_ids: JSON.parse(rawFormData.get('grandmothers_ids_field') as string || '[]'),
        grandfathers_ids: JSON.parse(rawFormData.get('grandfathers_ids_field') as string || '[]'),
        individuals_ids: JSON.parse(rawFormData.get('individuals_ids_field') as string || '[]'),        // TODO I think it is not as string.
    };
    modifiedFormData['gender'] = modifiedFormData['gender'] === 'ذكر' ? 'male' : modifiedFormData['gender'] === 'أنثى' ? 'female' : 'unknown';
    modifiedFormData['is_dead'] = modifiedFormData['is_dead'] === 'حي' ? 'alive' : modifiedFormData['is_dead'] === 'متوفى' ? 'dead' : 'unknown';
    const grandmothers_ids_to_english = modifiedFormData['grandmothers_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
            return {...e, relationshipSide: relationshipSideToEnglish[e.relationshipSide]}
        }
    )
    modifiedFormData['grandmothers_ids'] = grandmothers_ids_to_english;

    const grandfathers_ids_to_english = modifiedFormData['grandfathers_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
            return {...e, relationshipSide: relationshipSideToEnglish[e.relationshipSide]}
        }
    )
    modifiedFormData['grandfathers_ids'] = grandfathers_ids_to_english;

    const result = await updateIndividual(publicId, modifiedFormData);

    if (result) {
        refresh();
    } else {
        return false;
    }
}

// TODO add a return to page to notify admin user that the individual did not get deleted
export async function deleteIndividualServerAction(publicId: string) {
    const result = await deleteIndividual(publicId);
    if (result) {
        redirect(`/admin/individuals`);
    }
}
