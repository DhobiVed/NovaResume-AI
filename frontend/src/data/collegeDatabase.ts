export interface CollegeRecord {
  id: string;
  name: string;
  code: string;
  university: string;
  state: string;
  city: string;
  district: string;
  institution_type: 'Government Engineering College' | 'National Institute (IIT/NIT/IIIT)' | 'Autonomous University' | 'State University' | 'Private University' | 'Deemed University' | 'Ayush & Medical Institute';
  website: string;
  accreditation: string;
  departments: string[];
}

export const ALL_INDIA_COLLEGES: CollegeRecord[] = [
  // ── GUJARAT ─────────────────────────────────────────────────────────────
  {
    id: 'col-guj-01',
    name: 'Government Engineering College, Modasa (GEC Modasa)',
    code: 'GEC-MOD-016',
    university: 'Gujarat Technological University (GTU)',
    state: 'Gujarat',
    city: 'Modasa',
    district: 'Aravalli',
    institution_type: 'Government Engineering College',
    website: 'https://gecmodasa.ac.in',
    accreditation: 'NBA Accredited / AICTE Approved',
    departments: [
      'Computer Engineering',
      'Information Technology',
      'AI & Data Science',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Electronics & Communication'
    ]
  },
  {
    id: 'col-guj-02',
    name: 'L.D. College of Engineering (LDCE), Ahmedabad',
    code: 'LDCE-AHM-028',
    university: 'Gujarat Technological University (GTU)',
    state: 'Gujarat',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    institution_type: 'Government Engineering College',
    website: 'https://ldce.ac.in',
    accreditation: 'NBA Accredited / NAAC A++',
    departments: [
      'Computer Engineering',
      'Information Technology',
      'AI & Machine Learning',
      'Mechanical Engineering',
      'Chemical Engineering',
      'Biomedical Engineering',
      'Electrical Engineering'
    ]
  },
  {
    id: 'col-guj-03',
    name: 'Vishwakarma Government Engineering College (VGEC), Chandkheda',
    code: 'VGEC-CHAND-017',
    university: 'Gujarat Technological University (GTU)',
    state: 'Gujarat',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    institution_type: 'Government Engineering College',
    website: 'https://vgecg.ac.in',
    accreditation: 'NBA Accredited / AICTE Approved',
    departments: [
      'Computer Engineering',
      'Information Technology',
      'Power Electronics',
      'Chemical Engineering',
      'Civil Engineering'
    ]
  },
  {
    id: 'col-guj-04',
    name: 'Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat',
    code: 'SVNIT-SURAT-001',
    university: 'Autonomous / NIT Council',
    state: 'Gujarat',
    city: 'Surat',
    district: 'Surat',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://svnit.ac.in',
    accreditation: 'NIRF Top 50 / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'AI & Data Science',
      'Electronics & Communication',
      'Mechanical Engineering',
      'Chemical Engineering'
    ]
  },
  {
    id: 'col-guj-05',
    name: 'Indian Institute of Technology (IIT) Gandhinagar',
    code: 'IIT-GN-001',
    university: 'Autonomous / IIT Council',
    state: 'Gujarat',
    city: 'Gandhinagar',
    district: 'Gandhinagar',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iitgn.ac.in',
    accreditation: 'NIRF Top 25 / Institute of National Importance',
    departments: [
      'Computer Science & Engineering',
      'Artificial Intelligence',
      'Data Science & Analytics',
      'Electrical Engineering',
      'Biological Engineering'
    ]
  },
  {
    id: 'col-guj-06',
    name: 'DA-IICT (Dhirubhai Ambani Institute of ICT), Gandhinagar',
    code: 'DAIICT-GN-001',
    university: 'Autonomous / State Private',
    state: 'Gujarat',
    city: 'Gandhinagar',
    district: 'Gandhinagar',
    institution_type: 'Autonomous University',
    website: 'https://daiict.ac.in',
    accreditation: 'NAAC A+ Grade',
    departments: [
      'Information & Communication Technology',
      'Computational Science',
      'Mathematics & Computing',
      'Data Science'
    ]
  },
  {
    id: 'col-guj-07',
    name: 'Nirma University - Institute of Technology, Ahmedabad',
    code: 'NIRMA-IT-001',
    university: 'Nirma University',
    state: 'Gujarat',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    institution_type: 'Private University',
    website: 'https://technology.nirmauni.ac.in',
    accreditation: 'NAAC A+ / NBA Accredited',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Cyber Security',
      'Electrical Engineering',
      'Mechanical Engineering'
    ]
  },
  {
    id: 'col-guj-08',
    name: 'Dharmsinh Desai University (DDU), Nadiad',
    code: 'DDU-NAD-001',
    university: 'State University',
    state: 'Gujarat',
    city: 'Nadiad',
    district: 'Kheda',
    institution_type: 'State University',
    website: 'https://ddu.ac.in',
    accreditation: 'NIRF Ranked / NBA Accredited',
    departments: [
      'Computer Engineering',
      'Information Technology',
      'Chemical Engineering',
      'Electronics & Communication'
    ]
  },

  // ── DELHI & NCR ─────────────────────────────────────────────────────────
  {
    id: 'col-del-01',
    name: 'All India Institute of Ayurveda (AIIA), New Delhi',
    code: 'AIIA-ND-001',
    university: 'Autonomous / Ministry of Ayush, Govt. of India',
    state: 'Delhi',
    city: 'New Delhi',
    district: 'South Delhi',
    institution_type: 'Ayush & Medical Institute',
    website: 'https://aiia.gov.in',
    accreditation: 'NABH / NAAC A++ / Center of Excellence',
    departments: [
      'Dept of Ayush Clinical Informatics',
      'Dravyaguna & Herbal Drug Standardization',
      'Panchakarma & Smart Diagnostic Instrumentation',
      'Kaya Chikitsa & Clinical Research',
      'Ayush Bioinformatics & Health-Tech'
    ]
  },
  {
    id: 'col-del-02',
    name: 'Delhi Technological University (DTU), Delhi',
    code: 'DTU-DEL-001',
    university: 'State University',
    state: 'Delhi',
    city: 'New Delhi',
    district: 'North West Delhi',
    institution_type: 'State University',
    website: 'https://dtu.ac.in',
    accreditation: 'NIRF Top 35 / NAAC A',
    departments: [
      'Computer Science & Engineering',
      'Software Engineering',
      'Information Technology',
      'Mathematics & Computing',
      'Artificial Intelligence'
    ]
  },
  {
    id: 'col-del-03',
    name: 'Indian Institute of Technology (IIT) Delhi',
    code: 'IIT-DEL-001',
    university: 'Autonomous / IIT Council',
    state: 'Delhi',
    city: 'New Delhi',
    district: 'South Delhi',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://home.iitd.ac.in',
    accreditation: 'NIRF Top 2 / Institute of Eminence',
    departments: [
      'Computer Science & Engineering',
      'School of Artificial Intelligence (ScAI)',
      'Electrical Engineering',
      'Data Science & Engineering'
    ]
  },
  {
    id: 'col-del-04',
    name: 'Netaji Subhas University of Technology (NSUT), Delhi',
    code: 'NSUT-DEL-001',
    university: 'State University',
    state: 'Delhi',
    city: 'New Delhi',
    district: 'South West Delhi',
    institution_type: 'State University',
    website: 'https://nsut.ac.in',
    accreditation: 'NIRF Ranked / NAAC A',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Computer Science with Big Data Analytics',
      'Artificial Intelligence & Machine Learning'
    ]
  },
  {
    id: 'col-del-05',
    name: 'Indraprastha Institute of Information Technology (IIIT-Delhi)',
    code: 'IIIT-DEL-001',
    university: 'Autonomous / State University',
    state: 'Delhi',
    city: 'New Delhi',
    district: 'South Delhi',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iiitd.ac.in',
    accreditation: 'NAAC A Grade / AICTE Approved',
    departments: [
      'Computer Science & Applied Mathematics',
      'Computer Science & Artificial Intelligence',
      'Computational Biology',
      'Electronics & Communications'
    ]
  },

  // ── MAHARASHTRA ─────────────────────────────────────────────────────────
  {
    id: 'col-mah-01',
    name: 'Indian Institute of Technology (IIT) Bombay',
    code: 'IIT-BOM-001',
    university: 'Autonomous / IIT Council',
    state: 'Maharashtra',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iitb.ac.in',
    accreditation: 'NIRF Top 3 / Institute of Eminence',
    departments: [
      'Computer Science & Engineering',
      'Centre for Machine Intelligence & Data Science',
      'Electrical Engineering',
      'Biomedical Engineering'
    ]
  },
  {
    id: 'col-mah-02',
    name: 'College of Engineering Pune (COEP Technological University)',
    code: 'COEP-PUN-001',
    university: 'Unitary Public State University',
    state: 'Maharashtra',
    city: 'Pune',
    district: 'Pune',
    institution_type: 'Government Engineering College',
    website: 'https://coep.org.in',
    accreditation: 'NIRF Ranked / NAAC A+',
    departments: [
      'Computer Engineering',
      'Information Technology',
      'AI & Robotics',
      'Electronics & Telecommunication',
      'Mechanical Engineering'
    ]
  },
  {
    id: 'col-mah-03',
    name: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
    code: 'VJTI-MUM-001',
    university: 'Autonomous / University of Mumbai',
    state: 'Maharashtra',
    city: 'Mumbai',
    district: 'Mumbai City',
    institution_type: 'Government Engineering College',
    website: 'https://vjti.ac.in',
    accreditation: 'AICTE / NBA Accredited',
    departments: [
      'Computer Engineering',
      'Information Technology',
      'Electronics Engineering',
      'Mechanical Engineering'
    ]
  },
  {
    id: 'col-mah-04',
    name: 'Visvesvaraya National Institute of Technology (VNIT), Nagpur',
    code: 'VNIT-NAG-001',
    university: 'Autonomous / NIT Council',
    state: 'Maharashtra',
    city: 'Nagpur',
    district: 'Nagpur',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://vnit.ac.in',
    accreditation: 'NIRF Top 50 / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Electronics & Communication',
      'Electrical Engineering'
    ]
  },

  // ── KARNATAKA ───────────────────────────────────────────────────────────
  {
    id: 'col-kar-01',
    name: 'Indian Institute of Science (IISc), Bengaluru',
    code: 'IISC-BLR-001',
    university: 'Deemed to be University / Institute of Eminence',
    state: 'Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iisc.ac.in',
    accreditation: 'NIRF #1 University / NAAC A++',
    departments: [
      'Computational & Data Sciences',
      'Computer Science & Automation',
      'Centre for Cyber Security',
      'Bioengineering & Health Informatics'
    ]
  },
  {
    id: 'col-kar-02',
    name: 'R.V. College of Engineering (RVCE), Bengaluru',
    code: 'RVCE-BLR-001',
    university: 'Autonomous / VTU',
    state: 'Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    institution_type: 'Autonomous University',
    website: 'https://rvce.edu.in',
    accreditation: 'NIRF Ranked / NBA Accredited',
    departments: [
      'Computer Science & Engineering',
      'Information Science & Engineering',
      'AI & Machine Learning',
      'Cyber Security'
    ]
  },
  {
    id: 'col-kar-03',
    name: 'National Institute of Technology Karnataka (NITK), Surathkal',
    code: 'NITK-SUR-001',
    university: 'Autonomous / NIT Council',
    state: 'Karnataka',
    city: 'Mangaluru',
    district: 'Dakshina Kannada',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://nitk.ac.in',
    accreditation: 'NIRF Top 15 / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Mathematical & Computational Sciences',
      'Electronics & Communication'
    ]
  },

  // ── TAMIL NADU ──────────────────────────────────────────────────────────
  {
    id: 'col-tn-01',
    name: 'Indian Institute of Technology (IIT) Madras',
    code: 'IIT-MAD-001',
    university: 'Autonomous / IIT Council',
    state: 'Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iitm.ac.in',
    accreditation: 'NIRF #1 Overall India / Institute of Eminence',
    departments: [
      'Computer Science & Engineering',
      'Robert Bosch Centre for Data Science and AI',
      'Electrical Engineering',
      'Healthcare Technology Innovation Centre'
    ]
  },
  {
    id: 'col-tn-02',
    name: 'College of Engineering Guindy (Anna University), Chennai',
    code: 'CEG-CHN-001',
    university: 'Anna University',
    state: 'Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    institution_type: 'Government Engineering College',
    website: 'https://ceg.annauniv.edu',
    accreditation: 'NIRF Ranked / NAAC A++',
    departments: [
      'Computer Science & Engineering',
      'Information Science & Technology',
      'Electronics & Communication'
    ]
  },
  {
    id: 'col-tn-03',
    name: 'National Institute of Technology (NIT) Tiruchirappalli (NITT)',
    code: 'NITT-TRICHY-001',
    university: 'Autonomous / NIT Council',
    state: 'Tamil Nadu',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://nitt.edu',
    accreditation: 'NIRF #9 Engineering / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Computer Applications (MCA/M.Tech)',
      'Electronics & Communication'
    ]
  },
  {
    id: 'col-tn-04',
    name: 'Vellore Institute of Technology (VIT), Vellore',
    code: 'VIT-VEL-001',
    university: 'Deemed to be University',
    state: 'Tamil Nadu',
    city: 'Vellore',
    district: 'Vellore',
    institution_type: 'Deemed University',
    website: 'https://vit.ac.in',
    accreditation: 'NAAC A++ / NIRF Top 12',
    departments: [
      'School of Computer Science & Engineering',
      'Information Technology',
      'Artificial Intelligence & Robotics',
      'Data Science & Analytics'
    ]
  },

  // ── TELANGANA ───────────────────────────────────────────────────────────
  {
    id: 'col-tel-01',
    name: 'Indian Institute of Technology (IIT) Hyderabad',
    code: 'IIT-HYD-001',
    university: 'Autonomous / IIT Council',
    state: 'Telangana',
    city: 'Hyderabad',
    district: 'Sangareddy',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iith.ac.in',
    accreditation: 'NIRF #8 Engineering / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Department of Artificial Intelligence',
      'Biomedical Engineering',
      'Electrical Engineering'
    ]
  },
  {
    id: 'col-tel-02',
    name: 'International Institute of Information Technology (IIIT) Hyderabad',
    code: 'IIIT-HYD-001',
    university: 'Autonomous / Deemed University',
    state: 'Telangana',
    city: 'Hyderabad',
    district: 'Hyderabad',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iiit.ac.in',
    accreditation: 'NAAC A++ / Leader in NLP & AI Research',
    departments: [
      'Computer Science & Engineering',
      'Kohli Center on Intelligent Systems',
      'Language Technologies & Vernacular NLP',
      'Computational Natural Sciences'
    ]
  },

  // ── RAJASTHAN ───────────────────────────────────────────────────────────
  {
    id: 'col-raj-01',
    name: 'Birla Institute of Technology and Science (BITS), Pilani',
    code: 'BITS-PIL-001',
    university: 'Deemed to be University / Institute of Eminence',
    state: 'Rajasthan',
    city: 'Pilani',
    district: 'Jhunjhunu',
    institution_type: 'Deemed University',
    website: 'https://bits-pilani.ac.in',
    accreditation: 'NAAC A Grade / Top Ranked Autonomous',
    departments: [
      'Computer Science & Information Systems',
      'Data Science & Artificial Intelligence',
      'Electrical & Electronics',
      'Biological Sciences'
    ]
  },
  {
    id: 'col-raj-02',
    name: 'Malaviya National Institute of Technology (MNIT), Jaipur',
    code: 'MNIT-JAI-001',
    university: 'Autonomous / NIT Council',
    state: 'Rajasthan',
    city: 'Jaipur',
    district: 'Jaipur',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://mnit.ac.in',
    accreditation: 'NIRF Top 40 / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Artificial Intelligence & Data Engineering',
      'Electronics & Communication'
    ]
  },

  // ── UTTAR PRADESH ───────────────────────────────────────────────────────
  {
    id: 'col-up-01',
    name: 'Indian Institute of Technology (IIT) Kanpur',
    code: 'IIT-KAN-001',
    university: 'Autonomous / IIT Council',
    state: 'Uttar Pradesh',
    city: 'Kanpur',
    district: 'Kanpur Nagar',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iitk.ac.in',
    accreditation: 'NIRF Top 5 / Institute of National Importance',
    departments: [
      'Computer Science & Engineering',
      'Centre for Cybersecurity & Cyber Defence',
      'Cognitive Science & Artificial Intelligence',
      'Electrical Engineering'
    ]
  },
  {
    id: 'col-up-02',
    name: 'Motilal Nehru National Institute of Technology (MNNIT), Allahabad',
    code: 'MNNIT-ALL-001',
    university: 'Autonomous / NIT Council',
    state: 'Uttar Pradesh',
    city: 'Prayagraj',
    district: 'Prayagraj',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://mnnit.ac.in',
    accreditation: 'NIRF Top 45 / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication'
    ]
  },

  // ── WEST BENGAL ─────────────────────────────────────────────────────────
  {
    id: 'col-wb-01',
    name: 'Indian Institute of Technology (IIT) Kharagpur',
    code: 'IIT-KGP-001',
    university: 'Autonomous / IIT Council',
    state: 'West Bengal',
    city: 'Kharagpur',
    district: 'Paschim Medinipur',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iitkgp.ac.in',
    accreditation: 'NIRF Top 6 / Institute of Eminence',
    departments: [
      'Computer Science & Engineering',
      'Center of Excellence in Artificial Intelligence',
      'Medical Science & Technology (Biomedical)',
      'Electronics & Electrical Communication'
    ]
  },
  {
    id: 'col-wb-02',
    name: 'Jadavpur University - Faculty of Engineering, Kolkata',
    code: 'JU-KOL-001',
    university: 'State University',
    state: 'West Bengal',
    city: 'Kolkata',
    district: 'Kolkata',
    institution_type: 'State University',
    website: 'https://jaduniv.edu.in',
    accreditation: 'NIRF Top 10 University / NAAC A++',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Telecommunication'
    ]
  },

  // ── KERALA ──────────────────────────────────────────────────────────────
  {
    id: 'col-ker-01',
    name: 'National Institute of Technology (NIT) Calicut',
    code: 'NITC-CAL-001',
    university: 'Autonomous / NIT Council',
    state: 'Kerala',
    city: 'Kozhikode',
    district: 'Kozhikode',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://nitc.ac.in',
    accreditation: 'NIRF Top 25 / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics & Communication'
    ]
  },

  // ── MADHYA PRADESH ──────────────────────────────────────────────────────
  {
    id: 'col-mp-01',
    name: 'Indian Institute of Technology (IIT) Indore',
    code: 'IIT-IND-001',
    university: 'Autonomous / IIT Council',
    state: 'Madhya Pradesh',
    city: 'Indore',
    district: 'Indore',
    institution_type: 'National Institute (IIT/NIT/IIIT)',
    website: 'https://iiti.ac.in',
    accreditation: 'NIRF Top 15 Engineering / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Data Science & Management',
      'Electrical Engineering'
    ]
  },

  // ── PUNJAB ──────────────────────────────────────────────────────────────
  {
    id: 'col-pun-01',
    name: 'Thapar Institute of Engineering and Technology, Patiala',
    code: 'TIET-PAT-001',
    university: 'Deemed to be University',
    state: 'Punjab',
    city: 'Patiala',
    district: 'Patiala',
    institution_type: 'Deemed University',
    website: 'https://thapar.edu',
    accreditation: 'NIRF Top 25 / NAAC A+',
    departments: [
      'Computer Science & Engineering',
      'Computer Engineering with AI',
      'Software Development & Data Science'
    ]
  }
];

export const ALL_INDIAN_STATES = [
  'All India',
  'Gujarat',
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
  'Madhya Pradesh',
  'Punjab',
  'Andhra Pradesh',
  'Bihar',
  'Haryana',
  'Odisha'
] as const;

/**
 * Filter/Search Colleges across India by query (name, code, city), state, or district.
 */
export function searchColleges(
  query: string = '',
  stateFilter: string = 'All India',
  cityFilter: string = ''
): CollegeRecord[] {
  const q = query.trim().toLowerCase();
  const st = stateFilter.trim();
  const ct = cityFilter.trim().toLowerCase();

  return ALL_INDIA_COLLEGES.filter((col) => {
    const matchesState = st === 'All India' || !st || col.state.toLowerCase() === st.toLowerCase();
    const matchesCity = !ct || col.city.toLowerCase().includes(ct);

    if (!q) return matchesState && matchesCity;

    const matchesQuery =
      col.name.toLowerCase().includes(q) ||
      col.code.toLowerCase().includes(q) ||
      col.city.toLowerCase().includes(q) ||
      col.state.toLowerCase().includes(q) ||
      col.university.toLowerCase().includes(q);

    return matchesState && matchesCity && matchesQuery;
  });
}
