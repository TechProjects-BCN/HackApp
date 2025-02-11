import { FormState } from '@/app/lib/definitions'
 
export async function signup(formData: FormData) {
  // Validate form fields
  const validatedFields = {
    username: formData.get('username'),
    password: formData.get('password'),
  }
  console.log(validatedFields);

  // 2. Prepare data for insertion into database
  const { username, password } = validatedFields
  // e.g. Hash the user's password before storing it 
  // 3. Insert the user into the database or call an Auth Library's API
  
  if (!username) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }
}