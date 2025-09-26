// College-specific API routes for multi-tenant system
import express from 'express';
import { CollegeService } from '../database/collegeService';
import { TimetableService } from '../services/timetableService';
import { AuthMiddleware } from '../middleware/auth';

const router = express.Router();

// Middleware to extract college context
const extractCollegeContext = async (req: any, res: any, next: any) => {
  try {
    // Extract college ID from various sources
    let collegeId = req.headers['x-college-id'] || req.query.collegeId;
    
    // If not provided, try to get from user's college
    if (!collegeId && req.user) {
      collegeId = req.user.collegeId;
    }
    
    // If still not found, try to get from domain
    if (!collegeId) {
      const host = req.get('host');
      const collegeResponse = await CollegeService.getCollegeByDomain(host);
      if (collegeResponse.success && collegeResponse.data) {
        collegeId = collegeResponse.data.id;
      }
    }
    
    if (!collegeId) {
      return res.status(400).json({
        success: false,
        error: 'College context not found'
      });
    }
    
    req.collegeId = collegeId;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to extract college context'
    });
  }
};

// College Information Routes
router.get('/info', extractCollegeContext, async (req: any, res: any) => {
  try {
    const collegeResponse = await CollegeService.getCollege(req.collegeId);
    res.json(collegeResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get college information'
    });
  }
});

router.get('/stats', extractCollegeContext, AuthMiddleware.authenticate, async (req: any, res: any) => {
  try {
    // Check if user has access to this college
    const hasAccess = await CollegeService.validateCollegeAccess(req.user.id, req.collegeId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this college'
      });
    }
    
    const statsResponse = await CollegeService.getCollegeStats(req.collegeId);
    res.json(statsResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get college statistics'
    });
  }
});

// College Settings Routes
router.get('/settings', extractCollegeContext, AuthMiddleware.authenticate, async (req: any, res: any) => {
  try {
    const collegeResponse = await CollegeService.getCollege(req.collegeId);
    if (!collegeResponse.success || !collegeResponse.data) {
      return res.status(404).json({
        success: false,
        error: 'College not found'
      });
    }
    
    res.json({
      success: true,
      data: collegeResponse.data.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get college settings'
    });
  }
});

router.put('/settings', extractCollegeContext, AuthMiddleware.authenticate, async (req: any, res: any) => {
  try {
    // Only college admins can update settings
    if (req.user.role !== 'college_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    const updateResponse = await CollegeService.updateCollege(req.collegeId, {
      settings: req.body
    });
    
    res.json(updateResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update college settings'
    });
  }
});

// College Registration Route (Public)
router.post('/register', async (req: any, res: any) => {
  try {
    const { name, domain, contactEmail, contactPhone, address } = req.body;
    
    if (!name || !domain || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, domain, contactEmail'
      });
    }
    
    const collegeResponse = await CollegeService.createCollege({
      name,
      domain,
      contactEmail,
      contactPhone,
      address
    });
    
    if (collegeResponse.success && collegeResponse.data) {
      // Create the first admin user
      const adminResponse = await CollegeService.createCollegeAdmin(
        collegeResponse.data.id,
        {
          email: contactEmail,
          firstName: 'Admin',
          lastName: name,
          password: 'TempPassword123!' // Should be changed on first login
        }
      );
      
      res.status(201).json({
        success: true,
        data: {
          college: collegeResponse.data,
          admin: adminResponse.data
        },
        message: 'College registered successfully. Admin credentials sent to email.'
      });
    } else {
      res.status(400).json(collegeResponse);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to register college'
    });
  }
});

// College-specific Timetable Routes
router.get('/timetables', extractCollegeContext, AuthMiddleware.authenticate, async (req: any, res: any) => {
  try {
    const timetablesResponse = await TimetableService.getCollegeTimetables(req.collegeId);
    res.json(timetablesResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get college timetables'
    });
  }
});

router.post('/timetables/generate', extractCollegeContext, AuthMiddleware.authenticate, async (req: any, res: any) => {
  try {
    // Only admins can generate timetables
    if (req.user.role !== 'college_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only college admins can generate timetables'
      });
    }
    
    const timetableResponse = await TimetableService.generateTimetable(
      req.collegeId,
      req.body,
      req.user.id
    );
    
    res.json(timetableResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate timetable'
    });
  }
});

// College Integration Routes
router.get('/integration/config', extractCollegeContext, AuthMiddleware.authenticate, async (req: any, res: any) => {
  try {
    // Only college admins can access integration config
    if (req.user.role !== 'college_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    const collegeResponse = await CollegeService.getCollege(req.collegeId);
    if (!collegeResponse.success || !collegeResponse.data) {
      return res.status(404).json({
        success: false,
        error: 'College not found'
      });
    }
    
    // Generate integration configuration
    const integrationConfig = {
      collegeId: req.collegeId,
      apiKey: `tk_${req.collegeId}_${Date.now()}`, // TODO: Generate proper API key
      embedUrl: `${process.env.FRONTEND_URL}/embed/${req.collegeId}`,
      apiBaseUrl: `${process.env.API_BASE_URL}/api/colleges/${req.collegeId}`,
      customization: {
        primaryColor: collegeResponse.data.primaryColor || '#6366f1',
        secondaryColor: collegeResponse.data.secondaryColor || '#8b5cf6',
        logo: collegeResponse.data.logo
      }
    };
    
    res.json({
      success: true,
      data: integrationConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get integration configuration'
    });
  }
});

// Public embed route (no authentication required)
router.get('/embed', extractCollegeContext, async (req: any, res: any) => {
  try {
    const collegeResponse = await CollegeService.getCollege(req.collegeId);
    if (!collegeResponse.success || !collegeResponse.data) {
      return res.status(404).json({
        success: false,
        error: 'College not found'
      });
    }
    
    // Return embed configuration
    res.json({
      success: true,
      data: {
        collegeId: req.collegeId,
        collegeName: collegeResponse.data.name,
        embedUrl: `${process.env.FRONTEND_URL}/embed/${req.collegeId}`,
        customization: {
          primaryColor: collegeResponse.data.primaryColor || '#6366f1',
          secondaryColor: collegeResponse.data.secondaryColor || '#8b5cf6',
          logo: collegeResponse.data.logo
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get embed configuration'
    });
  }
});

export default router;
