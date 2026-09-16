const Department = require('../models/Department');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Get all active departments
// @route   GET /api/departments
// @access  Public
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('headDoctor', 'name email phone avatar')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department by ID with its doctors
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('headDoctor', 'name email');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const doctors = await DoctorProfile.find({ department: department._id, isActive: true })
      .populate('user', 'name email phone avatar')
      .sort({ experienceYears: -1 });

    res.status(200).json({
      success: true,
      data: {
        department,
        doctors,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, icon, headDoctor } = req.body;

    const existing = await Department.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      icon,
      headDoctor: headDoctor || null,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
};
