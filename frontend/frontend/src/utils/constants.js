// ========== Roles ==========
export const ROLES = {
  ADMIN: 'admin',
  MP: 'mp',
  CITIZEN: 'citizen',
};

export const ROLE_LABELS = {
  admin: 'Ministry Admin',
  mp: 'Member of Parliament',
  citizen: 'Citizen',
};

// ========== Indian States & UTs ==========
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ========== Districts (key states for demo) ==========
export const DISTRICTS = {
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Allahabad', 'Agra', 'Kanpur', 'Gorakhpur', 'Jaunpur', 'Azamgarh', 'Meerut', 'Bareilly'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Satara', 'Ratnagiri'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bharatpur', 'Sikar', 'Bhilwara'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Dewas', 'Chhindwara'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Purnia', 'Darbhanga', 'Nalanda', 'Vaishali', 'Samastipur', 'Begusarai'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Kalaburagi', 'Davangere', 'Ballari', 'Tumakuru', 'Shimoga'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Mehsana'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'South 24 Parganas', 'Bardhaman', 'Hooghly', 'Malda'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kottayam'],
  'Delhi': ['New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Adilabad', 'Medak', 'Mahabubnagar', 'Rangareddy'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Berhampur', 'Rourkela', 'Sambalpur', 'Balasore', 'Puri', 'Koraput', 'Ganjam', 'Mayurbhanj'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Jorhat', 'Silchar', 'Nagaon', 'Tezpur', 'Tinsukia', 'Barpeta', 'Dhubri', 'Goalpara'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Moga', 'Firozpur'],
};

// ========== Work Types ==========
export const WORK_TYPES = [
  'Road Construction',
  'Bridge Construction',
  'Community Hall',
  'School Building',
  'Hospital / Health Center',
  'Water Supply',
  'Drainage System',
  'Electrification',
  'Sanitation Facility',
  'Park / Playground',
  'Bus Shelter',
  'Library',
  'Irrigation Canal',
  'Footpath / Pavement',
  'Market Complex',
];

// ========== Project Statuses ==========
export const PROJECT_STATUSES = [
  'On Track',
  'Delayed',
  'Under Review',
  'Completed',
  'High Risk',
];

// ========== Alert Categories ==========
export const ALERT_CATEGORIES = [
  'Cost Anomaly',
  'Duplicate Project',
  'Payment Anomaly',
  'Progress-Payment Mismatch',
  'Timeline Anomaly',
  'Unusual Utilization',
  'Contractor Pattern',
  'Geographic Pattern',
];

// ========== Alert Severities ==========
export const ALERT_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

// ========== Alert Statuses ==========
export const ALERT_STATUSES = ['New', 'Under Review', 'Assigned', 'Investigating', 'Resolved'];

// ========== Investigation Statuses ==========
export const INVESTIGATION_STATUSES = ['New', 'Assigned', 'Under Investigation', 'Awaiting Verification', 'Resolved'];

// ========== Risk Levels ==========
export const RISK_LEVELS = [
  { label: 'Low', min: 0, max: 39, color: '#22c55e' },
  { label: 'Moderate', min: 40, max: 59, color: '#f59e0b' },
  { label: 'High', min: 60, max: 74, color: '#f97316' },
  { label: 'Critical', min: 75, max: 100, color: '#ef4444' },
];

// ========== Report Types ==========
export const REPORT_TYPES = [
  'Project Monitoring',
  'Risk Analysis',
  'Expenditure',
  'Delay Analysis',
  'Contractor Performance',
  'State Overview',
  'Investigation Summary',
];

// ========== Demo Credentials ==========
export const DEMO_CREDENTIALS = [
  { role: 'Ministry Admin', email: 'admin@mpladsdrishti.gov.in', password: 'Admin@123' },
  { role: 'Member of Parliament', email: 'mp.varanasi@mpladsdrishti.gov.in', password: 'MP@123' },
  { role: 'Citizen', email: 'citizen@demo.com', password: 'Citizen@123' },
];
