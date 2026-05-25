'use server'

import {addNewIndividual, deleteIndividual, getAllIndividuals, getSpouseCandidateSexes, updateIndividual} from "@/lib/_data_access/individuals";
import {redirect} from 'next/navigation'
import {refresh} from 'next/cache'

function relationshipSideToEnglishFunction(relationshipSide: string) {
    return relationshipSide === 'جهة الأب' ? 'father' : relationshipSide === 'جهة الأم' ? 'mother' : 'unknown';
}

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
    // modifiedFormData['gender'] = modifiedFormData['gender'] === 'ذكر' ? 'male' : modifiedFormData['gender'] === 'أنثى' ? 'female' : 'unknown';
    // modifiedFormData['is_dead'] = modifiedFormData['is_dead'] === 'حي' ? 'alive' : modifiedFormData['is_dead'] === 'متوفى' ? 'dead' : 'unknown';
    const grandmothers_ids_to_english = modifiedFormData['grandmothers_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
        return {...e, relationshipSide: relationshipSideToEnglishFunction(e.relationshipSide)}
    }
    )
    modifiedFormData['grandmothers_ids'] = grandmothers_ids_to_english;

    const grandfathers_ids_to_english = modifiedFormData['grandfathers_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
            return {...e, relationshipSide: relationshipSideToEnglishFunction(e.relationshipSide)}
        }
    )
    modifiedFormData['grandfathers_ids'] = grandfathers_ids_to_english;

    // siblings_ids
    const siblings_ids_to_english = modifiedFormData['siblings_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
        return {...e, relationshipSide: relationshipSideToEnglishFunction(e.relationshipSide)}
    }
    )
    modifiedFormData['siblings_ids'] = siblings_ids_to_english;


    // individuals_ids
    const individuals_ids_to_english = modifiedFormData['individuals_ids'].map(function doSmth(e: {public_id: string; relationship: string}) {
        return {...e, relationship: relationshipSideToEnglishFunction(e.relationship)}
    }
    )
    modifiedFormData['individuals_ids'] = individuals_ids_to_english;


    // // spouses_ids
    // const spouses_ids_to_english = modifiedFormData['spouses_ids'].map(function doSmth(e: {public_id: string; is_divorced: string}) {
    //     return {...e, is_divorced: isDivorcedToEnglishFunction(e.is_divorced)}
    // }
    // )
    // modifiedFormData['spouses_ids'] = spouses_ids_to_english;

    console.log('modifiedFormData: ', modifiedFormData);

    const result = await addNewIndividual(modifiedFormData);

    if (result) {
        redirect(`/admin/individuals`)
    }
}

// const genderArabicToEnglish: Record<string, string> = {
//     'ذكر': 'male',
//     'أنثى': 'female',
//     'غير معلوم': 'unknown',
// };

function genderArabicToEnglish(gender: string) {
    return gender === 'ذكر' ? 'male' : gender === 'أنثى' ? 'female' : 'unknown';
}

function individualToOption(ind: {
    public_id: string;
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
}) {
    return {
        public_id: ind.public_id,
        label: [ind.first_name, ind.parent_name, ind.last_name].filter(Boolean).join(' '),
    };
}

export async function getSpouseOptionsServerAction(subjectSexArabic: string, excludePublicId?: string) {
    const subjectSex = genderArabicToEnglish(subjectSexArabic) ?? 'unknown';
    const individuals = await getAllIndividuals(undefined, {
        sexes: getSpouseCandidateSexes(subjectSex),
        excludePublicId,
    });
    return individuals.map(individualToOption);
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
            return {...e, relationshipSide: relationshipSideToEnglishFunction(e.relationshipSide)}
        }
    )
    modifiedFormData['grandmothers_ids'] = grandmothers_ids_to_english;

    const grandfathers_ids_to_english = modifiedFormData['grandfathers_ids'].map(function doSmth(e: {public_id: string; relationshipSide: string}) {
            return {...e, relationshipSide: relationshipSideToEnglishFunction(e.relationshipSide)}
        }
    )
    modifiedFormData['grandfathers_ids'] = grandfathers_ids_to_english;

    const result = await updateIndividual(publicId, modifiedFormData);

    if (result) {
        refresh();
        return true;
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
