// helpers/sessionCandidateHelper.js

/**
 * Helper functions for creating candidates and sessions
 */

const API_BASE_URL = 'http://localhost:5000';
export const getListId = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidates/list/max-id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        listId: (data.maxId || 0) + 1
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to get max ID'
      };
    }
  } catch (error) {
    console.error('Error getting list ID:', error);
    return {
      success: false,
      message: `Network error: ${error.message}`
    };
  }
};
// Algorithm 1: Create a single candidate
export const createCandidate = async (candidateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidates/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...candidateData
      })
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        candidateId: data.candidateId,
        candidate: data.candidate,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create candidate'
      };
    }
  } catch (error) {
    console.error('Error creating candidate:', error);
    return {
      success: false,
      message: `Network error: ${error.message}`
    };
  }
};

// Algorithm 2: Create multiple candidates in bulk
export const createCandidatesBulk = async (listId, candidatesData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidates/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listId,
        candidates: candidatesData
      })
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        candidateIds: data.candidateIds,
        count: data.count,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create candidates in bulk'
      };
    }
  } catch (error) {
    console.error('Error creating candidates in bulk:', error);
    return {
      success: false,
      message: `Network error: ${error.message}`
    };
  }
};

// Algorithm 3: Create a session
export const createSession = async (sessionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        sessionId: data.sessionId,
        session: data.session,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create session'
      };
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return {
      success: false,
      message: `Network error: ${error.message}`
    };
  }
};

// Algorithm 4: Get or create a candidate list
export const getOrCreateCandidateList = async (listName, userId) => {
  try {
    // First, try to get an existing list by name
    const searchResponse = await fetch(`${API_BASE_URL}/candidates/list/search?name=${encodeURIComponent(listName)}`);
    const searchData = await searchResponse.json();
    
    if (searchData.success && searchData.lists && searchData.lists.length > 0) {
      // Return the first matching list
      return {
        success: true,
        listId: searchData.lists[0].id,
        list: searchData.lists[0],
        message: 'Found existing list'
      };
    }
    
    // If no list found, create a new one
    // Note: You need to implement createList API endpoint or adjust based on your API
    const createResponse = await fetch(`${API_BASE_URL}/candidates/list/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: listName,
        userId: userId,
        description: `Candidate list for ${listName}`
      })
    });
    
    const createData = await createResponse.json();
    
    if (createData.success) {
      return {
        success: true,
        listId: createData.listId,
        list: createData.list,
        message: 'Created new list'
      };
    } else {
      return {
        success: false,
        message: createData.message || 'Failed to create list'
      };
    }
  } catch (error) {
    console.error('Error getting or creating list:', error);
    return {
      success: false,
      message: `Network error: ${error.message}`
    };
  }
};

// Algorithm 5: Main workflow - Create candidates and session
export const createSessionWithCandidates = async (sessionData, candidatesData, listName = null) => {
  console.log('Starting session creation workflow...');
  
  // Step 1: Validate inputs
  if (!sessionData.sessionCode) {
    return {
      success: false,
      message: 'Session code is required'
    };
  }
  
  if (!sessionData.candidatesListId && !listName) {
    return {
      success: false,
      message: 'Either candidatesListId or listName is required'
    };
  }
  
  const validCandidates = candidatesData.filter(c => c.candidateFullName && c.candidateFullName.trim() !== '');
  
  if (validCandidates.length === 0) {
    return {
      success: false,
      message: 'At least one valid candidate is required'
    };
  }
  
  let listId = sessionData.candidatesListId;
  let listCreationResult = null;
  
  // Step 2: Get or create list if needed
  if (!listId && listName) {
    listCreationResult = await getOrCreateCandidateList(listName, sessionData.userId);
    
    if (!listCreationResult.success) {
      return {
        success: false,
        message: `Failed to get/create list: ${listCreationResult.message}`
      };
    }
    
    listId = listCreationResult.listId;
    console.log(`Using list ID: ${listId}`);
  }
  
  // Step 3: Create candidates
  console.log(`Creating ${validCandidates.length} candidates...`);
  
  let candidateIds = [];
  let candidateCreationResult = null;
  
  // Try bulk creation first (more efficient)
  candidateCreationResult = await createCandidatesBulk(listId, validCandidates);
  
  if (!candidateCreationResult.success) {
    console.log('Bulk creation failed, trying individual creation...');
    
    // Fallback to individual creation
    candidateIds = [];
    for (const candidate of validCandidates) {
      const individualResult = await createCandidate(listId, candidate);
      if (individualResult.success) {
        candidateIds.push(individualResult.candidateId);
      } else {
        console.warn(`Failed to create candidate ${candidate.candidateFullName}: ${individualResult.message}`);
      }
    }
    
    if (candidateIds.length === 0) {
      return {
        success: false,
        message: 'Failed to create any candidates'
      };
    }
  } else {
    candidateIds = candidateCreationResult.candidateIds || [];
  }
  
  console.log(`Successfully created ${candidateIds.length} candidates`);
  
  // Step 4: Create session with the list ID
  console.log('Creating session...');
  
  const sessionPayload = {
    ...sessionData,
    candidatesListId: listId  // Ensure we use the correct list ID
  };
  
  const sessionResult = await createSession(sessionPayload);
  
  if (!sessionResult.success) {
    return {
      success: false,
      message: `Session creation failed: ${sessionResult.message}`,
      candidatesCreated: candidateIds.length,
      listId: listId
    };
  }
  
  // Step 5: Return complete success result
  return {
    success: true,
    message: `Successfully created session "${sessionResult.session.sessionCode}" with ${candidateIds.length} candidates`,
    sessionId: sessionResult.sessionId,
    session: sessionResult.session,
    listId: listId,
    candidateIds: candidateIds,
    candidatesCount: candidateIds.length,
    listCreated: listCreationResult ? listCreationResult.message.includes('Created') : false
  };
};

// Algorithm 6: Create session with auto-generated list name
export const createSessionWithAutoList = async (sessionData, candidatesData) => {
  const autoListName = `session-${sessionData.sessionCode}-${Date.now()}`;
  
  return await createSessionWithCandidates(
    sessionData,
    candidatesData,
    autoListName
  );
};

// Algorithm 7: Validate candidate data
export const validateCandidateData = (candidate) => {
  const errors = [];
  
  if (!candidate.candidateFullName || candidate.candidateFullName.trim() === '') {
    errors.push('Candidate full name is required');
  }
  
  if (candidate.candidateOrder && (candidate.candidateOrder < 1 || candidate.candidateOrder > 1000)) {
    errors.push('Candidate order must be between 1 and 1000');
  }
  
  if (candidate.score && (candidate.score < 0 || candidate.score > 100)) {
    errors.push('Score must be between 0 and 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Algorithm 8: Validate session data
export const validateSessionData = (sessionData) => {
  const errors = [];
  
  if (!sessionData.sessionCode || sessionData.sessionCode.trim() === '') {
    errors.push('Session code is required');
  }
  
  if (!sessionData.type || sessionData.type.trim() === '') {
    errors.push('Session type is required');
  }
  
  if (!sessionData.userId || sessionData.userId < 1) {
    errors.push('Valid user ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Algorithm 9: Format candidates for API
export const formatCandidatesForAPI = (candidates) => {
  return candidates.map((candidate, index) => ({
    candidateOrder: candidate.candidateOrder || index + 1,
    candidateFullName: candidate.candidateFullName || '',
    infos: candidate.infos || candidate.description || '',
    score: candidate.score || null,
    date: candidate.date || new Date().toISOString().split('T')[0],
    status: candidate.status || 'pending'
  }));
};

// Algorithm 10: Get session with candidates (combined data)
export const getSessionWithCandidates = async (sessionId) => {
  try {
    // Get session data
    const sessionResponse = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
    const sessionData = await sessionResponse.json();
    
    if (!sessionData.success || !sessionData.session) {
      return {
        success: false,
        message: sessionData.message || 'Failed to fetch session'
      };
    }
    
    // Get candidates for this session's list
    const candidatesResponse = await fetch(`${API_BASE_URL}/candidates/list/${sessionData.session.candidatesListId}`);
    const candidatesData = await candidatesResponse.json();
    
    if (!candidatesData.success) {
      return {
        success: false,
        message: candidatesData.message || 'Failed to fetch candidates'
      };
    }
    
    // Return combined data
    return {
      success: true,
      session: sessionData.session,
      candidates: candidatesData.candidates || [],
      candidatesCount: candidatesData.count || 0,
      message: `Found session with ${candidatesData.count || 0} candidates`
    };
    
  } catch (error) {
    console.error('Error getting session with candidates:', error);
    return {
      success: false,
      message: `Network error: ${error.message}`
    };
  }
};

// Export all functions
export default {
  createCandidate,
  createCandidatesBulk,
  createSession,
  getOrCreateCandidateList,
  createSessionWithCandidates,
  createSessionWithAutoList,
  validateCandidateData,
  validateSessionData,
  formatCandidatesForAPI,
  getSessionWithCandidates
};