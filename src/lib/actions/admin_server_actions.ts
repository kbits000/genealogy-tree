'use server'

export async function PrintStatement(formData: FormData) {
    console.log('PrintStatement');
    console.log(formData);
    const rawFormData = {
        firstNameField: formData.get('first_name_field'),
        parentNameField: formData.get('parent_name_field'),
        grandparentNameField: formData.get('grandparent_name_field'),
        lastNameField: formData.get('last_name_field'),
        genderField: formData.get('gender_field')
    };


}