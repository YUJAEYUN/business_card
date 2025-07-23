import { supabase } from './supabase'

/**
 * Check if user has completed the onboarding tutorial
 */
export async function checkTutorialCompleted(userEmail: string): Promise<boolean> {
  try {
    console.log('🔍 Checking tutorial status for user:', userEmail)

    const { data, error } = await supabase
      .from('profiles')
      .select('tutorial_completed')
      .eq('email', userEmail)
      .maybeSingle()

    console.log('📊 Supabase response:', { data, error })

    if (error) {
      console.error('❌ Supabase error:', error)
      // If there's an error, assume tutorial not completed
      return false
    }

    if (!data) {
      console.log('👤 No profile found for user, assuming tutorial not completed')
      return false
    }

    const result = data?.tutorial_completed || false
    console.log('✅ Tutorial completed status:', result)
    return result
  } catch (error) {
    console.error('💥 Caught error in checkTutorialCompleted:', error)
    return false
  }
}

/**
 * Mark tutorial as completed for the user
 */
export async function markTutorialCompleted(userEmail: string): Promise<boolean> {
  try {
    console.log('✅ Marking tutorial as completed for user:', userEmail)

    const { error } = await supabase
      .from('profiles')
      .update({ tutorial_completed: true })
      .eq('email', userEmail)

    if (error) {
      console.error('❌ Error marking tutorial as completed:', error)
      return false
    }

    console.log('🎉 Tutorial marked as completed successfully')
    return true
  } catch (error) {
    console.error('💥 Caught error marking tutorial as completed:', error)
    return false
  }
}

/**
 * Reset tutorial status (for testing purposes)
 */
export async function resetTutorialStatus(userEmail: string): Promise<boolean> {
  try {
    console.log('🔄 Resetting tutorial status for user:', userEmail)

    const { error } = await supabase
      .from('profiles')
      .update({ tutorial_completed: false })
      .eq('email', userEmail)

    if (error) {
      console.error('❌ Error resetting tutorial status:', error)
      return false
    }

    console.log('🔄 Tutorial status reset successfully')
    return true
  } catch (error) {
    console.error('💥 Error resetting tutorial status:', error)
    return false
  }
}
