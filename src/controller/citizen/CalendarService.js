const axios = require('axios');

const CALENDARIFIC_API_KEY = process.env.CALENDARIFIC_API_KEY;

const getCurrentMonthHolidays = async (req, res) => {
    try {
        const country = 'EG';
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_API_KEY}&country=${country}&year=${currentYear}&type=national`;


        const response = await axios.get(apiUrl, {
            timeout: 5000
        });

        if (response.data.meta.code !== 200) {
            throw new Error(response.data.meta.error_detail || 'API request failed');
        }

        const holidays = response.data.response.holidays
            .filter(holiday => {
                const holidayDate = new Date(holiday.date.iso);
                return holidayDate.getMonth() === currentMonth;
            })
            .sort((a, b) => new Date(a.date.iso) - new Date(b.date.iso))
            .map(holiday => {
                const dateObj = new Date(holiday.date.iso);
                const day = dateObj.getDate();
                const month = dateObj.getMonth() + 1; // Months are 0-indexed
                const year = dateObj.getFullYear();
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = dayNames[dateObj.getDay()];
                
                return {
                    name: holiday.name,
                    date: `${day}/${month}/${year}`, // Formatted as DD/MM/YYYY
                    dayName: dayName,
                    description: holiday.description || ''
                };
            });

        res.status(200).json({
            success: true,
            data: holidays
        });
    } catch (error) {
        console.error('Error in getCurrentMonthHolidays:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch holidays'
        });
    }
};

module.exports = {
    getCurrentMonthHolidays
};