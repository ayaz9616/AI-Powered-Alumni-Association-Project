import express from 'express';
import Alumni from '../models/Alumni';

const router = express.Router();

// GET /api/alumni - Get all alumni with search, filter, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      course = '',
      batch = '',
      city = '',
      company = '',
      page = '1',
      limit = '12'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Text search across multiple fields
    if (search) {
      query.$text = { $search: search as string };
    }

    // Course filter
    if (course) {
      query['course.name'] = course;
    }

    // Batch filter
    if (batch) {
      query['batch.year'] = batch;
    }

    // City filter (searches in both livesIn and homeTown)
    if (city) {
      query.$or = [
        { 'livesIn.city': new RegExp(city as string, 'i') },
        { 'homeTown.city': new RegExp(city as string, 'i') }
      ];
    }

    // Company filter (searches in experience field)
    if (company) {
      query.experience = new RegExp(company as string, 'i');
    }

    // Execute query with pagination
    const [alumni, total] = await Promise.all([
      Alumni.find(query)
        .select('-__v')
        .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Alumni.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: alumni,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alumni',
      error: error.message
    });
  }
});

// GET /api/alumni/stats - Get alumni statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalAlumni,
      courseStats,
      batchStats,
      cityStats
    ] = await Promise.all([
      Alumni.countDocuments(),
      Alumni.aggregate([
        {
          $group: {
            _id: '$course.name',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Alumni.aggregate([
        {
          $group: {
            _id: '$batch.year',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]),
      Alumni.aggregate([
        {
          $group: {
            _id: '$livesIn.city',
            count: { $sum: 1 }
          }
        },
        { $match: { _id: { $ne: '' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalAlumni,
        byCourse: courseStats.map(s => ({ course: s._id, count: s.count })),
        byBatch: batchStats.map(s => ({ batch: s._id, count: s.count })),
        topCities: cityStats.map(s => ({ city: s._id, count: s.count }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching alumni stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alumni statistics',
      error: error.message
    });
  }
});

// GET /api/alumni/:id - Get single alumni by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alumni = await Alumni.findOne({ id }).select('-__v').lean();

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    res.json({
      success: true,
      data: alumni
    });
  } catch (error: any) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alumni',
      error: error.message
    });
  }
});

export default router;
