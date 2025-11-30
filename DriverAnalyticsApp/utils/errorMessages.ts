
export function getUserFriendlyError(error: any): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessage = error?.message || error?.toString() || '';
  const errorString = errorMessage.toLowerCase();

  // Network errors
  if (
    errorString.includes('network') ||
    errorString.includes('fetch') ||
    errorString.includes('connection') ||
    errorString.includes('timeout')
  ) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Authentication errors
  if (
    errorString.includes('session expired') ||
    errorString.includes('not authenticated') ||
    errorString.includes('please login again') ||
    errorString.includes('unauthorized') ||
    errorString.includes('token')
  ) {
    return 'Your session has expired. Please log in again.';
  }

  // Validation errors
  if (errorString.includes('validation') || errorString.includes('invalid')) {
    if (errorString.includes('email')) {
      return 'Please enter a valid email address.';
    }
    if (errorString.includes('password')) {
      return 'Password must be at least 8 characters long.';
    }
    return 'Please check your input and try again.';
  }

  // Not found errors
  if (errorString.includes('not found') || errorString.includes('404')) {
    return 'The requested item could not be found.';
  }

  // Permission errors
  if (
    errorString.includes('access denied') ||
    errorString.includes('forbidden') ||
    errorString.includes('permission')
  ) {
    return 'You do not have permission to perform this action.';
  }

  // Server errors
  if (errorString.includes('server error') || errorString.includes('500')) {
    return 'The server encountered an error. Please try again later.';
  }

  // Specific error messages
  if (errorString.includes('email already registered')) {
    return 'This email is already registered. Please use a different email or sign in.';
  }

  if (errorString.includes('incorrect password') || errorString.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }

  if (errorString.includes('family') && errorString.includes('not found')) {
    return 'Family not found. Please check the invite code and try again.';
  }

  if (errorString.includes('invite code')) {
    return 'Invalid invite code. Please check and try again.';
  }

  if (errorString.includes('trip') && errorString.includes('not found')) {
    return 'Trip not found. It may have been deleted.';
  }

  // Return original message if it's user-friendly, otherwise generic message
  if (errorMessage.length < 100 && !errorMessage.includes('Error:')) {
    return errorMessage;
  }

  return 'Something went wrong. Please try again.';
}

export function getSuccessMessage(action: string): string {
  const messages: Record<string, string> = {
    login: 'Welcome back!',
    register: 'Account created successfully!',
    tripStart: 'Trip started successfully!',
    tripStop: 'Trip completed!',
    tripDelete: 'Trip deleted successfully.',
    familyCreate: 'Family account created!',
    familyJoin: 'Successfully joined family!',
    familyLeave: 'You have left the family.',
    inviteCopy: 'Invite code copied to clipboard!',
    dataSync: 'Data synced successfully!',
  };

  return messages[action] || 'Operation completed successfully!';
}

