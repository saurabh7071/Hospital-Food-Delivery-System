exports.getAllPatients = async (req, res) => {
    try {
        const patients = await PatientDetails.find({});
        console.log('Total patients in database:', patients.length); // Debug log
        
        res.status(200).json({
            success: true,
            data: patients,
            message: 'Patients retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getAllPatients:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 