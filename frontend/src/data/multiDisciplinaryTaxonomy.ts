import type { SkillDomain, SkillItem } from '../types/careerConnect';

/**
 * PRODUCTION MULTI-DISCIPLINARY SKILL TAXONOMY
 * SIH Problem Statement SIH26044: Portal for Academia - Industry Collaboration
 * 
 * Supports:
 * 1. Mechanical Engineering
 * 2. Civil Engineering
 * 3. Electrical Engineering
 * 4. Electronics & Communication (ECE)
 * 5. Computer Science & IT (Programming is ONE subcategory)
 * 6. Chemical Engineering
 * 7. Pharmacy & Pharmaceutical Sciences
 * 8. Management & Commerce
 * 9. Biotechnology & Life Sciences
 * + Runtime Extensible via Firestore (Super Admin CRUD)
 */

export const BUILTIN_SKILL_DOMAINS: SkillDomain[] = [
  // ── 1. MECHANICAL ENGINEERING ──────────────────────────────────────────
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    code: 'MECH',
    description: 'Computer-aided design (CAD), manufacturing processes, GD&T, CNC machining, thermodynamics, and industrial automation.',
    iconName: 'Wrench',
    isCore: true,
    displayOrder: 1,
    status: 'active',
    categories: [
      {
        id: 'cad_design',
        domainId: 'mechanical',
        name: 'CAD & 3D Modeling',
        code: 'MECH_CAD',
        description: 'Parametric 3D solid modeling, assembly design, drafting, and mechanical simulation.',
        skills: [
          {
            id: 'solidworks',
            domainId: 'mechanical',
            categoryId: 'cad_design',
            name: 'SolidWorks',
            code: 'SW-CAD',
            description: 'Industry-standard parametric 3D modeling, assembly design, sheet metal, and FEA simulation.',
            inDemandRating: 'Critical',
            aliases: ['solidworks', 'sw', '3d cad', 'dassault solidworks'],
            coreDisciplines: ['Mechanical Engineering', 'Automobile Engineering', 'Aerospace Engineering', 'Mechatronics'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'sw-sketching',
                title: '2D Sketching, Relations & Constraints',
                description: 'Fully defining 2D sketches using geometric relations and smart dimensions.',
                externalReferences: [
                  { sourceName: 'SolidWorks Official Help', resourceTitle: 'Sketching Basics & Geometric Relations', resourceUrl: 'https://help.solidworks.com/2021/english/SolidWorks/sldworks/c_Sketching.htm', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Computer Aided Engineering Design (IIT Kanpur)', resourceUrl: 'https://nptel.ac.in/courses/112104031', isPrimary: false }
                ]
              },
              {
                id: 'sw-features',
                title: '3D Part Modeling & Advanced Features',
                description: 'Extruded boss/base, revolved cut, sweep, loft, fillet, and rib features.',
                externalReferences: [
                  { sourceName: 'SolidWorks Official Help', resourceTitle: 'Part Modeling Features', resourceUrl: 'https://help.solidworks.com/2021/english/SolidWorks/sldworks/c_Features.htm', isPrimary: true }
                ]
              },
              {
                id: 'sw-assemblies',
                title: 'Bottom-up & Top-down Assemblies',
                description: 'Standard, advanced, and mechanical mates, interference detection, and exploded views.',
                externalReferences: [
                  { sourceName: 'SolidWorks Official Help', resourceTitle: 'Assembly Mates and Verification', resourceUrl: 'https://help.solidworks.com/2021/english/SolidWorks/sldworks/c_Mates_Overview.htm', isPrimary: true }
                ]
              },
              {
                id: 'sw-drafting',
                title: '2D Engineering Drawings & Bill of Materials (BOM)',
                description: 'Creating orthographic projections, section views, detail views, and generating automated BOMs.',
                externalReferences: [
                  { sourceName: 'SolidWorks Official Help', resourceTitle: 'Detailing and Drawing Views', resourceUrl: 'https://help.solidworks.com/2021/english/SolidWorks/sldworks/c_Drawing_Views.htm', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'autocad_mech',
            domainId: 'mechanical',
            categoryId: 'cad_design',
            name: 'AutoCAD (Mechanical)',
            code: 'ACAD-MECH',
            description: '2D drafting, layout detailing, layer management, and mechanical fabrication drawings.',
            inDemandRating: 'High',
            aliases: ['autocad', 'acad', 'autodesk mechanical'],
            coreDisciplines: ['Mechanical Engineering', 'Production Engineering', 'Automobile Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'acad-drafting',
                title: '2D Mechanical Geometry & Precision Drafting',
                description: 'Object snaps, coordinates, polar tracking, and dynamic input for engineering drafts.',
                externalReferences: [
                  { sourceName: 'Autodesk Knowledge Network', resourceTitle: 'AutoCAD Drafting & Geometry Documentation', resourceUrl: 'https://help.autodesk.com/view/ACD/2024/ENU/?guid=GUID-89F3A932-B2A8-43B6-8C37-0105342D0DB0', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Engineering Drawing and Computer Graphics (IIT Kharagpur)', resourceUrl: 'https://nptel.ac.in/courses/112105125', isPrimary: false }
                ]
              },
              {
                id: 'acad-layers-blocks',
                title: 'Layers, Blocks & Standard Mechanical Symbols',
                description: 'Managing layer states, dynamic blocks, attributes, and ASME/ISO standard symbols.',
                externalReferences: [
                  { sourceName: 'Autodesk Knowledge Network', resourceTitle: 'About Layers and Blocks', resourceUrl: 'https://help.autodesk.com/view/ACD/2024/ENU/?guid=GUID-E5B7ED87-3E3B-4D04-8E1E-2B601C2F5AC2', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'creo_parametric',
            domainId: 'mechanical',
            categoryId: 'cad_design',
            name: 'PTC Creo Parametric',
            code: 'CREO',
            description: 'High-end engineering modeling, mechanism analysis, and parametric assembly synthesis.',
            inDemandRating: 'High',
            aliases: ['creo', 'pro/engineer', 'ptc creo'],
            coreDisciplines: ['Mechanical Engineering', 'Automotive Engineering', 'Tool Design'],
            isPopular: false,
            status: 'active',
            topics: [
              {
                id: 'creo-modeling',
                title: 'Parametric Modeling & Mechanism Dynamics',
                description: 'Mechanism connections (pin, slider, cylinder) and dynamic kinematics analysis.',
                externalReferences: [
                  { sourceName: 'PTC Learning Connector', resourceTitle: 'Creo Parametric Help Center', resourceUrl: 'https://support.ptc.com/help/creo/creo_pma/r9.0/usascii/index.html', isPrimary: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'manufacturing',
        domainId: 'mechanical',
        name: 'Manufacturing & Metrology',
        code: 'MECH_MFG',
        description: 'CNC programming, precision machining, GD&T tolerancing, and quality inspection.',
        skills: [
          {
            id: 'gdt',
            domainId: 'mechanical',
            categoryId: 'manufacturing',
            name: 'GD&T (Geometric Dimensioning & Tolerancing)',
            code: 'ASME-Y14.5',
            description: 'Engineering tolerance standards based on ASME Y14.5 and ISO standards for precision fit.',
            inDemandRating: 'Critical',
            aliases: ['gd&t', 'gdt', 'tolerancing', 'geometric tolerancing', 'asme y14.5'],
            coreDisciplines: ['Mechanical Engineering', 'Production Engineering', 'Quality Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'gdt-datums',
                title: 'Datum Reference Frames & Feature Control Frames',
                description: 'Primary, secondary, and tertiary datums, MMC/LMC/RFS material condition modifiers.',
                externalReferences: [
                  { sourceName: 'ASME Standards', resourceTitle: 'ASME Y14.5 Dimensioning and Tolerancing Overview', resourceUrl: 'https://www.asme.org/codes-standards/find-codes-standards/y14-5-dimensioning-tolerancing', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Inspection and Quality Control in Manufacturing (IIT Roorkee)', resourceUrl: 'https://nptel.ac.in/courses/112107219', isPrimary: false }
                ]
              },
              {
                id: 'gdt-tolerances',
                title: 'Form, Orientation, Location & Runout Tolerances',
                description: 'Flatness, cylindricity, perpendicularity, parallelism, true position, concentricity, and total runout.',
                externalReferences: [
                  { sourceName: 'GD&T Basics Reference Guide', resourceTitle: 'Geometric Tolerances and Application Rules', resourceUrl: 'https://www.gdandtbasics.com/gdt-symbols/', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'cnc_machining',
            domainId: 'mechanical',
            categoryId: 'manufacturing',
            name: 'CNC Machining & G-Code Programming',
            code: 'CNC-PROG',
            description: 'CNC milling, turning, manual G-code & M-code programming, tool offsets, and CAM toolpaths.',
            inDemandRating: 'High',
            aliases: ['cnc', 'cnc programming', 'g-code', 'm-code', 'cnc milling', 'cam'],
            coreDisciplines: ['Mechanical Engineering', 'Production Engineering', 'Manufacturing'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'cnc-gcodes',
                title: 'G-Code & M-Code Fundamentals',
                description: 'G00 (rapid), G01 (linear), G02/G03 (circular interpolation), canned cycles (G81, G83, G76).',
                externalReferences: [
                  { sourceName: 'Haas Automation CNC Manual', resourceTitle: 'Haas CNC Lathe and Mill G-Code Programming Guide', resourceUrl: 'https://www.haascnc.com/service/troubleshooting-and-how-to/manuals.html', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'CNC Machining Technology (IIT Madras)', resourceUrl: 'https://nptel.ac.in/courses/112106179', isPrimary: false }
                ]
              },
              {
                id: 'cnc-tooling',
                title: 'Speeds, Feeds, Tool Work Coordinate Offsets (G54-G59)',
                description: 'Cutting velocity, feed per tooth, spindle speed calculation, tool length offsets (G43 H-codes).',
                externalReferences: [
                  { sourceName: 'Sandvik Coromant Academy', resourceTitle: 'Machining Formulas & Tooling Guide', resourceUrl: 'https://www.sandvik.coromant.com/en-gb/knowledge/machining-formulas-definitions', isPrimary: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'mech_automation',
        domainId: 'mechanical',
        name: 'Automation & Mechatronics',
        code: 'MECH_AUTO',
        description: 'Hydraulic and pneumatic circuits, mechatronic actuators, and industrial robotic arms.',
        skills: [
          {
            id: 'hydraulics_pneumatics',
            domainId: 'mechanical',
            categoryId: 'mech_automation',
            name: 'Hydraulics & Pneumatics',
            code: 'FLUID-POWER',
            description: 'Fluid power circuit design, direction control valves (DCVs), actuators, and electro-pneumatics.',
            inDemandRating: 'Moderate',
            aliases: ['hydraulics', 'pneumatics', 'fluid power'],
            coreDisciplines: ['Mechanical Engineering', 'Mechatronics Engineering'],
            isPopular: false,
            status: 'active',
            topics: [
              {
                id: 'fluid-valves',
                title: 'Directional Control, Pressure Relief & Flow Control Valves',
                description: 'Symbolic representation (ISO 1219), 4/3, 5/2 DCVs, pilot-operated check valves, and accumulators.',
                externalReferences: [
                  { sourceName: 'Festo Didactic Technical Documentation', resourceTitle: 'Basic Pneumatics and Hydraulics Circuit Design', resourceUrl: 'https://www.festo-didactic.com/', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 2. CIVIL ENGINEERING ────────────────────────────────────────────────
  {
    id: 'civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    description: 'Structural design & analysis, Revit BIM, AutoCAD Civil, surveying, geomatics, and construction management.',
    iconName: 'Building',
    isCore: true,
    displayOrder: 2,
    status: 'active',
    categories: [
      {
        id: 'civil_cad_bim',
        domainId: 'civil',
        name: 'CAD & Building Information Modeling (BIM)',
        code: 'CIVIL_BIM',
        description: 'Civil drafting, 3D architectural modeling, BIM parametric coordination, and structural drafting.',
        skills: [
          {
            id: 'autocad_civil',
            domainId: 'civil',
            categoryId: 'civil_cad_bim',
            name: 'AutoCAD (Civil)',
            code: 'ACAD-CIVIL',
            description: 'Civil plan drafting, architectural elevations, structural detailing, and site layouts.',
            inDemandRating: 'Critical',
            aliases: ['autocad civil', 'civil cad', 'building drawing'],
            coreDisciplines: ['Civil Engineering', 'Architecture', 'Urban Planning'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'acad-civ-plans',
                title: 'Floor Plans, Elevations, Sections & Municipal Submission Drawings',
                description: 'Drafting residential and commercial floor plans according to National Building Code (NBC) norms.',
                externalReferences: [
                  { sourceName: 'Autodesk Knowledge Network', resourceTitle: 'AutoCAD Architectural and Civil Drafting Documentation', resourceUrl: 'https://help.autodesk.com/view/ACD/2024/ENU/', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Civil Engineering Building Drawings (IIT Roorkee)', resourceUrl: 'https://nptel.ac.in/courses/105107122', isPrimary: false }
                ]
              }
            ]
          },
          {
            id: 'revit_bim',
            domainId: 'civil',
            categoryId: 'civil_cad_bim',
            name: 'Autodesk Revit & BIM',
            code: 'REVIT-BIM',
            description: 'Building Information Modeling (BIM), parametric families, clash detection, and 3D architectural models.',
            inDemandRating: 'Critical',
            aliases: ['revit', 'bim', 'building information modeling', 'autodesk revit'],
            coreDisciplines: ['Civil Engineering', 'Structural Engineering', 'Construction Technology'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'revit-fundamentals',
                title: 'Parametric BIM Modeling, Levels & Grids',
                description: 'Defining site levels, structural grid systems, structural walls, columns, slabs, and curtain walls.',
                externalReferences: [
                  { sourceName: 'Autodesk Revit Help', resourceTitle: 'Autodesk Revit Official Documentation & Workflows', resourceUrl: 'https://help.autodesk.com/view/RVT/2024/ENU/', isPrimary: true }
                ]
              },
              {
                id: 'revit-families-schedules',
                title: 'Revit Families, Material Takeoffs & Quantities',
                description: 'Custom parametric component families, automated door/window schedules, and volume estimations.',
                externalReferences: [
                  { sourceName: 'Autodesk Revit Help', resourceTitle: 'Schedules and Quantity Takeoffs in Revit', resourceUrl: 'https://help.autodesk.com/view/RVT/2024/ENU/?guid=GUID-F5012586-1C6D-460B-9759-BA5C4459C755', isPrimary: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'structural_analysis',
        domainId: 'civil',
        name: 'Structural Analysis & Design',
        code: 'CIVIL_STRUCT',
        description: 'Finite element structural analysis, RCC & steel design according to IS 456 & IS 800.',
        skills: [
          {
            id: 'staad_pro',
            domainId: 'civil',
            categoryId: 'structural_analysis',
            name: 'STAAD.Pro',
            code: 'STAAD',
            description: 'Structural 3D space frame analysis, dead/live/wind/seismic load calculations, and RCC beam/column design.',
            inDemandRating: 'High',
            aliases: ['staad', 'staad.pro', 'bentley staad', 'structural analysis'],
            coreDisciplines: ['Civil Engineering', 'Structural Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'staad-loadings',
                title: 'Dead, Live, Wind & Seismic Load Combinations (IS 1893 & IS 875)',
                description: 'Assigning seismic zones, response reduction factors, wind pressures, and critical load combinations.',
                externalReferences: [
                  { sourceName: 'Bentley STAAD Communities', resourceTitle: 'STAAD.Pro Structural Analysis Documentation', resourceUrl: 'https://bentleysystems.service-now.com/community?id=kb_article&sys_id=staad-docs', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Design of Reinforced Concrete Structures (IIT Kharagpur)', resourceUrl: 'https://nptel.ac.in/courses/105105105', isPrimary: false }
                ]
              }
            ]
          },
          {
            id: 'etabs',
            domainId: 'civil',
            categoryId: 'structural_analysis',
            name: 'ETABS',
            code: 'ETABS-CSI',
            description: 'High-rise structural building analysis, non-linear dynamic analysis, shear wall and diaphragm modeling.',
            inDemandRating: 'High',
            aliases: ['etabs', 'csi etabs', 'high rise structural design'],
            coreDisciplines: ['Civil Engineering', 'Structural Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'etabs-shearwall',
                title: 'Multi-Storey Frame & Shear Wall Design',
                description: 'P-Delta analysis, rigid vs semi-rigid diaphragms, dynamic response spectrum, and story drift limits.',
                externalReferences: [
                  { sourceName: 'Computers and Structures, Inc. (CSI)', resourceTitle: 'ETABS Design Manual and Analysis Reference', resourceUrl: 'https://www.csiamerica.com/products/etabs', isPrimary: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'surveying_geomatics',
        domainId: 'civil',
        name: 'Surveying & Geomatics',
        code: 'CIVIL_SURV',
        description: 'Total station operation, GPS leveling, contouring, and GIS mapping.',
        skills: [
          {
            id: 'surveying_totalstation',
            domainId: 'civil',
            categoryId: 'surveying_geomatics',
            name: 'Surveying & Total Station',
            code: 'SURV-TS',
            description: 'Traversing, trigonometric leveling, electronic distance measurement (EDM), and contouring.',
            inDemandRating: 'High',
            aliases: ['surveying', 'total station', 'theodolite', 'leveling'],
            coreDisciplines: ['Civil Engineering', 'Geomatics', 'Infrastructure Engineering'],
            isPopular: false,
            status: 'active',
            topics: [
              {
                id: 'surv-traverse',
                title: 'Closed Traverse, Balancing & Coordinate Computation',
                description: 'Bowditch and Transit methods for balancing traverses, latitude, departure, and coordinate calculation.',
                externalReferences: [
                  { sourceName: 'NPTEL India', resourceTitle: 'Surveying (IIT Roorkee)', resourceUrl: 'https://nptel.ac.in/courses/105107121', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 3. ELECTRICAL ENGINEERING ───────────────────────────────────────────
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    code: 'EE',
    description: 'Industrial automation (PLC, SCADA), power systems, electrical machines, drives, and MATLAB/Simulink.',
    iconName: 'Zap',
    isCore: true,
    displayOrder: 3,
    status: 'active',
    categories: [
      {
        id: 'industrial_automation',
        domainId: 'electrical',
        name: 'Industrial Automation & Controls',
        code: 'EE_AUTO',
        description: 'Programmable Logic Controllers (PLC), SCADA systems, HMI interfaces, and industrial fieldbuses.',
        skills: [
          {
            id: 'plc_programming',
            domainId: 'electrical',
            categoryId: 'industrial_automation',
            name: 'PLC Programming',
            code: 'PLC-PROG',
            description: 'Ladder Logic (LD), Function Block Diagrams (FBD), timers, counters, and interlocks on Siemens/Allen-Bradley.',
            inDemandRating: 'Critical',
            aliases: ['plc', 'programmable logic controller', 'ladder logic', 'siemens plc', 'allen bradley'],
            coreDisciplines: ['Electrical Engineering', 'Instrumentation & Control', 'Mechatronics'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'plc-ladder',
                title: 'Ladder Logic Programming & Bit Instructions',
                description: 'Normally open (NO), normally closed (NC), coils, latching circuits, and interlocking logic.',
                externalReferences: [
                  { sourceName: 'Siemens Industry Support', resourceTitle: 'TIA Portal SIMATIC S7-1200 / S7-1500 Programming Guide', resourceUrl: 'https://support.industry.siemens.com/', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Industrial Automation and Control (IIT Kharagpur)', resourceUrl: 'https://nptel.ac.in/courses/108105088', isPrimary: false }
                ]
              },
              {
                id: 'plc-timers-counters',
                title: 'Timers (TON, TOF, TP) & Up/Down Counters',
                description: 'Time base resolution, preset and accumulator registers, and sequence control cascades.',
                externalReferences: [
                  { sourceName: 'Rockwell Automation Literature', resourceTitle: 'Logix 5000 Controllers General Instructions Reference Manual', resourceUrl: 'https://literature.rockwellautomation.com/', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'scada_systems',
            domainId: 'electrical',
            categoryId: 'industrial_automation',
            name: 'SCADA & HMI Systems',
            code: 'SCADA-HMI',
            description: 'Supervisory Control and Data Acquisition, industrial telemetry, tag databases, alarms, and trending.',
            inDemandRating: 'High',
            aliases: ['scada', 'hmi', 'wonderware', 'wincc', 'ignition scada'],
            coreDisciplines: ['Electrical Engineering', 'Instrumentation Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'scada-arch',
                title: 'SCADA Architecture, OPC Server & Modbus Protocols',
                description: 'Client-server architecture, RTU vs PLC interface, Modbus RTU/TCP memory addressing, and alarm logs.',
                externalReferences: [
                  { sourceName: 'Modbus Organization Standards', resourceTitle: 'Modbus Protocol Specification Documentation', resourceUrl: 'https://www.modbus.org/specs.php', isPrimary: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'power_systems',
        domainId: 'electrical',
        name: 'Power Systems & Machines',
        code: 'EE_POWER',
        description: 'Generation, transmission, distribution, switchgear protection, and power system analysis.',
        skills: [
          {
            id: 'power_system_analysis',
            domainId: 'electrical',
            categoryId: 'power_systems',
            name: 'Power Systems & Protection',
            code: 'POWER-SYS',
            description: 'Load flow studies, symmetrical fault analysis, protection relays, circuit breakers, and substation design.',
            inDemandRating: 'High',
            aliases: ['power systems', 'protection relay', 'switchgear', 'etap'],
            coreDisciplines: ['Electrical Engineering', 'Power Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'power-faults',
                title: 'Per-Unit System & Symmetrical/Unsymmetrical Faults',
                description: 'Base MVA and kV normalization, 3-phase symmetrical faults, single line-to-ground (LG) sequence networks.',
                externalReferences: [
                  { sourceName: 'IEEE Power & Energy Society', resourceTitle: 'Power System Relaying Standards & Fundamentals', resourceUrl: 'https://www.ieee-pes.org/', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Power System Analysis (IIT Kharagpur)', resourceUrl: 'https://nptel.ac.in/courses/108105067', isPrimary: false }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ee_simulation',
        domainId: 'electrical',
        name: 'Simulation & Computing',
        code: 'EE_SIM',
        description: 'Power electronic circuit modeling, feedback control loops, and dynamic machine simulations.',
        skills: [
          {
            id: 'matlab_simulink',
            domainId: 'electrical',
            categoryId: 'ee_simulation',
            name: 'MATLAB & Simulink',
            code: 'MATLAB-SIM',
            description: 'Simscape Electrical, control system toolboxes, state-space modeling, and digital signal processing.',
            inDemandRating: 'Critical',
            aliases: ['matlab', 'simulink', 'simscape', 'control systems matlab'],
            coreDisciplines: ['Electrical Engineering', 'ECE', 'Mechanical Engineering', 'Robotics'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'matlab-simscape',
                title: 'Simscape Electrical Modeling (Inverters, Machines, PWM)',
                description: 'Buck/boost converters, sinusoidal PWM generation, DC motor speed control, and closed-loop PID tuning.',
                externalReferences: [
                  { sourceName: 'MathWorks Official Documentation', resourceTitle: 'Simulink and Simscape Electrical User Documentation', resourceUrl: 'https://www.mathworks.com/help/simulink/', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 4. ELECTRONICS & COMMUNICATION ENGINEERING (ECE) ────────────────────
  {
    id: 'ece',
    name: 'Electronics & Communication',
    code: 'ECE',
    description: 'Embedded systems, microcontrollers, VLSI design, PCB design, IoT hardware, and digital communication.',
    iconName: 'Cpu',
    isCore: true,
    displayOrder: 4,
    status: 'active',
    categories: [
      {
        id: 'embedded_systems',
        domainId: 'ece',
        name: 'Embedded Systems & Firmware',
        code: 'ECE_EMBED',
        description: 'Microcontroller architectures, register-level Embedded C, interrupts, and real-time operating systems.',
        skills: [
          {
            id: 'embedded_c',
            domainId: 'ece',
            categoryId: 'embedded_systems',
            name: 'Embedded C',
            code: 'EMBED-C',
            description: 'Low-level hardware register access, volatile qualifier, bitwise masking, memory-mapped I/O, and ISRs.',
            inDemandRating: 'Critical',
            aliases: ['embedded c', 'bare metal c', 'firmware c'],
            coreDisciplines: ['Electronics & Communication', 'Electrical Engineering', 'Computer Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'embed-registers',
                title: 'Bitwise Manipulation, Volatile Keyword & Register Control',
                description: 'Bit shifting, masking (SET, CLEAR, TOGGLE bits), preventing compiler register caching with volatile.',
                externalReferences: [
                  { sourceName: 'Barr Group Embedded Standards', resourceTitle: 'Embedded C Coding Standard & Best Practices', resourceUrl: 'https://barrgroup.com/embedded-systems/books/embedded-c-coding-standard', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'Embedded System Design with ARM (IIT Kharagpur)', resourceUrl: 'https://nptel.ac.in/courses/106105193', isPrimary: false }
                ]
              },
              {
                id: 'embed-interrupts',
                title: 'Interrupt Service Routines (ISRs) & Timers/Counters',
                description: 'NVIC priority levels, edge-triggered external interrupts, re-entrancy rules, and timer PWM generation.',
                externalReferences: [
                  { sourceName: 'ARM Developer Documentation', resourceTitle: 'Cortex-M Nested Vectored Interrupt Controller (NVIC)', resourceUrl: 'https://developer.arm.com/documentation/dui0552/a/cortex-m3-peripherals/nested-vectored-interrupt-controller', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'arm_microcontrollers',
            domainId: 'ece',
            categoryId: 'embedded_systems',
            name: 'ARM Cortex Microcontrollers',
            code: 'ARM-MCU',
            description: 'ARM Cortex-M0/M4 architectures, STM32 HAL/LL drivers, DMA controllers, and FreeRTOS tasks.',
            inDemandRating: 'High',
            aliases: ['arm', 'cortex-m', 'stm32', 'arm microcontroller'],
            coreDisciplines: ['Electronics & Communication', 'Embedded Systems'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'arm-stm32',
                title: 'STM32 Architecture, Clock Trees & DMA Transfers',
                description: 'Configuring PLL and clock prescalers, circular DMA for ADC/UART buffers without CPU overhead.',
                externalReferences: [
                  { sourceName: 'STMicroelectronics Resource Center', resourceTitle: 'STM32 Reference Manuals and HAL API Guides', resourceUrl: 'https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html', isPrimary: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'vlsi_microelectronics',
        domainId: 'ece',
        name: 'VLSI & Chip Design',
        code: 'ECE_VLSI',
        description: 'Hardware description languages (Verilog/VHDL), digital design, CMOS logic, and ASIC/FPGA flow.',
        skills: [
          {
            id: 'verilog_hdl',
            domainId: 'ece',
            categoryId: 'vlsi_microelectronics',
            name: 'Verilog HDL',
            code: 'VERILOG',
            description: 'RTL synthesis, synchronous state machines (FSM), blocking vs non-blocking assignments, testbenches.',
            inDemandRating: 'Critical',
            aliases: ['verilog', 'systemverilog', 'hdl', 'digital vlsi'],
            coreDisciplines: ['Electronics & Communication', 'Microelectronics'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'verilog-rtl',
                title: 'RTL Design, Always Blocks & Non-blocking (<=) Assignments',
                description: 'Sequential vs combinational logic modeling, preventing unwanted latches, and clock domain crossing.',
                externalReferences: [
                  { sourceName: 'IEEE Standards Association', resourceTitle: 'IEEE Standard for Verilog Hardware Description Language (IEEE 1364)', resourceUrl: 'https://standards.ieee.org/', isPrimary: true },
                  { sourceName: 'NPTEL India', resourceTitle: 'VLSI Design Flow: RTL to GDS (IIT Kharagpur)', resourceUrl: 'https://nptel.ac.in/courses/106105034', isPrimary: false }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'pcb_hardware',
        domainId: 'ece',
        name: 'PCB Design & Hardware Prototyping',
        code: 'ECE_PCB',
        description: 'Schematic capture, multi-layer PCB layout, trace impedance matching, and design for manufacturing (DFM).',
        skills: [
          {
            id: 'pcb_design_kicad',
            domainId: 'ece',
            categoryId: 'pcb_hardware',
            name: 'PCB Design (KiCad / Altium)',
            code: 'PCB-DESIGN',
            description: 'Component footprints, continuous ground planes, decoupling capacitor placement, and Gerber generation.',
            inDemandRating: 'High',
            aliases: ['pcb design', 'altium', 'kicad', 'schematic capture'],
            coreDisciplines: ['Electronics & Communication', 'Electrical Engineering'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'pcb-layout-rules',
                title: 'High-Frequency Trace Routing, Ground Planes & Decoupling',
                description: 'Differential pair routing (USB/Ethernet), minimizing loop inductance, and star grounding.',
                externalReferences: [
                  { sourceName: 'KiCad Official Documentation', resourceTitle: 'KiCad Schematic Editor and PCB Layout Manual', resourceUrl: 'https://docs.kicad.org/', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 5. COMPUTER SCIENCE & IT ────────────────────────────────────────────
  {
    id: 'cs_it',
    name: 'Computer Science & IT',
    code: 'CSE',
    description: 'Software development, programming languages, data structures, databases, cloud, cybersecurity, and AI/ML.',
    iconName: 'Code2',
    isCore: true,
    displayOrder: 5,
    status: 'active',
    categories: [
      {
        id: 'programming',
        domainId: 'cs_it',
        name: 'Programming & Scripting Languages',
        code: 'CS_LANG',
        description: 'Core syntax, object-oriented concepts, memory models, and standard libraries.',
        skills: [
          {
            id: 'python',
            domainId: 'cs_it',
            categoryId: 'programming',
            name: 'Python',
            code: 'PY',
            description: 'High-level dynamically typed language for web development, automation, and data science.',
            inDemandRating: 'Critical',
            aliases: ['python', 'py', 'python3'],
            coreDisciplines: ['Computer Science', 'Information Technology', 'AI & Data Science'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'py-core',
                title: 'Data Structures, Generators & List Comprehensions',
                description: 'Lists, dicts, sets, tuples, time complexities, generator expressions, and memory management.',
                externalReferences: [
                  { sourceName: 'Python Official Docs', resourceTitle: 'Python 3 Standard Library Documentation', resourceUrl: 'https://docs.python.org/3/', isPrimary: true }
                ]
              },
              {
                id: 'py-functions',
                title: 'Functions, Scopes, Decorators & Closures',
                description: 'First-class functions, mutable default arguments, LEGB scoping, decorators, args/kwargs, and generators.',
                externalReferences: [
                  { sourceName: 'Python Official Docs', resourceTitle: 'Python Functions and Defining Functions', resourceUrl: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions', isPrimary: true }
                ]
              },
              {
                id: 'py-oop',
                title: 'OOP, Decorators & Context Managers',
                description: 'Classes, dunder methods, metaclasses, decorators, and the with statement context protocol.',
                externalReferences: [
                  { sourceName: 'Python Official Docs', resourceTitle: 'Object-Oriented Programming and Data Model in Python', resourceUrl: 'https://docs.python.org/3/reference/datamodel.html', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'java',
            domainId: 'cs_it',
            categoryId: 'programming',
            name: 'Java',
            code: 'JAVA',
            description: 'Object-oriented, class-based language running on the Java Virtual Machine (JVM).',
            inDemandRating: 'Critical',
            aliases: ['java', 'jvm', 'jdk'],
            coreDisciplines: ['Computer Science', 'Information Technology'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'java-oop',
                title: 'OOP Principles, Polymorphism & Inheritance',
                description: 'Encapsulation, interfaces, abstract classes, method overriding, and dynamic dispatch.',
                externalReferences: [
                  { sourceName: 'Oracle Java Documentation', resourceTitle: 'The Java Tutorials - OOP Concepts', resourceUrl: 'https://docs.oracle.com/javase/tutorial/java/concepts/', isPrimary: true }
                ]
              },
              {
                id: 'java-collections',
                title: 'Java Collections Framework & Multithreading',
                description: 'List, Map, Set, Queue implementations, synchronizers, ExecutorService, and atomic operations.',
                externalReferences: [
                  { sourceName: 'Oracle Java Documentation', resourceTitle: 'Java Collections Framework Overview', resourceUrl: 'https://docs.oracle.com/javase/8/docs/technotes/guides/collections/', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'sql',
            domainId: 'cs_it',
            categoryId: 'programming',
            name: 'SQL & Relational Databases',
            code: 'SQL',
            description: 'Structured Query Language, schema design, ACID transactions, complex joins, and window functions.',
            inDemandRating: 'Critical',
            aliases: ['sql', 'rdbms', 'mysql', 'postgresql'],
            coreDisciplines: ['Computer Science', 'Information Technology', 'Data Science'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'sql-joins',
                title: 'SQL Joins & Relational Operations',
                description: 'INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN, CROSS JOIN, self-joins, anti-joins, and join predicate filtering.',
                externalReferences: [
                  { sourceName: 'PostgreSQL Official Documentation', resourceTitle: 'PostgreSQL Table Expressions and Queries', resourceUrl: 'https://www.postgresql.org/docs/current/queries-table-expressions.html', isPrimary: true }
                ]
              },
              {
                id: 'sql-queries',
                title: 'Complex Joins, Subqueries & Aggregations',
                description: 'INNER/OUTER joins, GROUP BY, HAVING, subqueries, and common table expressions (CTEs).',
                externalReferences: [
                  { sourceName: 'PostgreSQL Official Documentation', resourceTitle: 'PostgreSQL SQL Language Reference', resourceUrl: 'https://www.postgresql.org/docs/current/sql.html', isPrimary: true }
                ]
              }
            ]
          },
          {
            id: 'cpp',
            domainId: 'cs_it',
            categoryId: 'programming',
            name: 'C++',
            code: 'CPP',
            description: 'High-performance compiled language with manual memory management and template metaprogramming.',
            inDemandRating: 'High',
            aliases: ['c++', 'cpp', 'modern c++'],
            coreDisciplines: ['Computer Science', 'Low-Latency Engineering', 'Game Development'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'cpp-binary-search',
                title: 'Binary Search & Divide and Conquer',
                description: 'Binary search algorithms, lower_bound, upper_bound, overflow prevention, and search space reduction.',
                externalReferences: [
                  { sourceName: 'cppreference.com', resourceTitle: 'std::binary_search, lower_bound, upper_bound', resourceUrl: 'https://en.cppreference.com/w/cpp/algorithm/binary_search', isPrimary: true }
                ]
              },
              {
                id: 'cpp-pointers',
                title: 'Pointers, References & Dynamic Memory',
                description: 'Raw pointers, pointer arithmetic, new/delete, smart pointers (unique_ptr, shared_ptr).',
                externalReferences: [
                  { sourceName: 'cppreference.com', resourceTitle: 'C++ Reference - Memory Management & Smart Pointers', resourceUrl: 'https://en.cppreference.com/w/cpp/memory', isPrimary: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'core_cs',
        domainId: 'cs_it',
        name: 'Core Computer Science',
        code: 'CS_CORE',
        description: 'Foundational algorithmic concepts, operating systems, and computer network protocols.',
        skills: [
          {
            id: 'dsa',
            domainId: 'cs_it',
            categoryId: 'core_cs',
            name: 'Data Structures & Algorithms',
            code: 'DSA',
            description: 'Asymptotic complexity, arrays, linked lists, trees, graphs, dynamic programming, and sorting.',
            inDemandRating: 'Critical',
            aliases: ['dsa', 'data structures', 'algorithms'],
            coreDisciplines: ['Computer Science', 'Information Technology'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'dsa-graphs',
                title: 'Graph Algorithms (BFS, DFS, Dijkstra, TopoSort)',
                description: 'Adjacency list representation, cycle detection, shortest paths, and topological order.',
                externalReferences: [
                  { sourceName: 'NPTEL India', resourceTitle: 'Design and Analysis of Algorithms (Chennai Mathematical Institute / IIT Madras)', resourceUrl: 'https://nptel.ac.in/courses/106106131', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 6. CHEMICAL ENGINEERING ─────────────────────────────────────────────
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    code: 'CHEM',
    description: 'Process design, simulation (Aspen Plus), chemical plant safety (HAZOP), reaction kinetics, and unit operations.',
    iconName: 'FlaskConical',
    isCore: true,
    displayOrder: 6,
    status: 'active',
    categories: [
      {
        id: 'process_eng',
        domainId: 'chemical',
        name: 'Process Engineering & Simulation',
        code: 'CHEM_PROC',
        description: 'Flowsheeting, thermodynamic fluid property packages, and steady-state distillation design.',
        skills: [
          {
            id: 'aspen_plus',
            domainId: 'chemical',
            categoryId: 'process_eng',
            name: 'Aspen Plus / Simulation',
            code: 'ASPEN',
            description: 'Chemical process flowsheet simulation, reactor sizing, distillation columns, and heat exchanger networks.',
            inDemandRating: 'High',
            aliases: ['aspen', 'aspen plus', 'hysys', 'process simulation'],
            coreDisciplines: ['Chemical Engineering', 'Petroleum Engineering'],
            isPopular: false,
            status: 'active',
            topics: [
              {
                id: 'aspen-flowsheet',
                title: 'Thermodynamic Property Models & Distillation Columns',
                description: 'NRTL, Peng-Robinson EOS selection, RADFRAC column modeling, and convergence troubleshooting.',
                externalReferences: [
                  { sourceName: 'NPTEL India', resourceTitle: 'Chemical Process Simulation (IIT Kharagpur)', resourceUrl: 'https://nptel.ac.in/courses/103105060', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 7. PHARMACY & PHARMACEUTICAL SCIENCES ──────────────────────────────
  {
    id: 'pharmacy',
    name: 'Pharmacy / Pharmaceutical',
    code: 'PHARM',
    description: 'Pharmaceutical analysis (HPLC/UV), quality control (QC/QA), cGMP regulations, and drug formulation.',
    iconName: 'Pill',
    isCore: true,
    displayOrder: 7,
    status: 'active',
    categories: [
      {
        id: 'pharm_analysis',
        domainId: 'pharmacy',
        name: 'Pharmaceutical Analysis & QA',
        code: 'PHARM_QA',
        description: 'Analytical instrumentation, chromatography method validation, and cGMP compliance.',
        skills: [
          {
            id: 'hplc_analysis',
            domainId: 'pharmacy',
            categoryId: 'pharm_analysis',
            name: 'Pharmaceutical Analysis (HPLC)',
            code: 'HPLC',
            description: 'High-Performance Liquid Chromatography, mobile phase preparation, retention time, and assay calibration.',
            inDemandRating: 'High',
            aliases: ['hplc', 'pharmaceutical analysis', 'chromatography', 'quality control'],
            coreDisciplines: ['Pharmacy', 'Pharmaceutical Chemistry', 'Industrial Pharmacy'],
            isPopular: false,
            status: 'active',
            topics: [
              {
                id: 'hplc-method',
                title: 'Reversed-Phase HPLC, Resolution & Peak Symmetry',
                description: 'Stationary phase selection (C18), isocratic vs gradient elution, retention factors, and peak tailing.',
                externalReferences: [
                  { sourceName: 'USP Standards', resourceTitle: 'United States Pharmacopeia Chromatography Guidelines', resourceUrl: 'https://www.usp.org/', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 8. MANAGEMENT & COMMERCE ────────────────────────────────────────────
  {
    id: 'management',
    name: 'Management / Commerce',
    code: 'MGMT',
    description: 'Financial analysis, corporate accounting, business intelligence, Power BI, marketing, and supply chain.',
    iconName: 'Briefcase',
    isCore: true,
    displayOrder: 8,
    status: 'active',
    categories: [
      {
        id: 'finance_analytics',
        domainId: 'management',
        name: 'Finance & Business Analytics',
        code: 'MGMT_FIN',
        description: 'Financial statements, DCF valuation, dashboard reporting, and spreadsheet modeling.',
        skills: [
          {
            id: 'financial_modeling',
            domainId: 'management',
            categoryId: 'finance_analytics',
            name: 'Financial Modeling & Valuation',
            code: 'FIN-MODEL',
            description: 'Discounted Cash Flow (DCF), 3-statement financial models, sensitivity tables, and capital budgeting.',
            inDemandRating: 'Critical',
            aliases: ['financial modeling', 'valuation', 'dcf', 'corporate finance'],
            coreDisciplines: ['MBA', 'BBA', 'Commerce', 'Finance'],
            isPopular: true,
            status: 'active',
            topics: [
              {
                id: 'fin-dcf',
                title: '3-Statement Financial Forecasting & DCF Valuation',
                description: 'Forecasting income statements, balance sheets, free cash flow to firm (FCFF), and WACC calculation.',
                externalReferences: [
                  { sourceName: 'Corporate Finance Institute', resourceTitle: 'Financial Modeling Best Practices and Valuation Guidelines', resourceUrl: 'https://corporatefinanceinstitute.com/resources/financial-modeling/', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // ── 9. BIOTECHNOLOGY & LIFE SCIENCES ───────────────────────────────────
  {
    id: 'biotech',
    name: 'Biotechnology & Life Sciences',
    code: 'BIOTECH',
    description: 'Molecular biology, PCR techniques, bioinformatics (BLAST/docking), cell culture, and bioprocess technology.',
    iconName: 'Dna',
    isCore: true,
    displayOrder: 9,
    status: 'active',
    categories: [
      {
        id: 'bioinformatics_lab',
        domainId: 'biotech',
        name: 'Bioinformatics & Molecular Biology',
        code: 'BIO_MOL',
        description: 'Sequence alignment, phylogenetic trees, molecular docking, and PCR amplification.',
        skills: [
          {
            id: 'bioinformatics_tools',
            domainId: 'biotech',
            categoryId: 'bioinformatics_lab',
            name: 'Bioinformatics & Sequence Analysis',
            code: 'BIO-INFO',
            description: 'NCBI BLAST, multiple sequence alignment, FASTA parsing, and molecular docking basics.',
            inDemandRating: 'Moderate',
            aliases: ['bioinformatics', 'blast', 'ncbi', 'computational biology'],
            coreDisciplines: ['Biotechnology', 'Bioinformatics', 'Life Sciences'],
            isPopular: false,
            status: 'active',
            topics: [
              {
                id: 'bio-blast',
                title: 'BLAST Sequence Alignment & Scoring Matrices (PAM / BLOSUM)',
                description: 'Local vs global alignment (Smith-Waterman vs Needleman-Wunsch), E-values, and homology identification.',
                externalReferences: [
                  { sourceName: 'NCBI Education Portal', resourceTitle: 'BLAST Documentation & Sequence Analysis Tutorials', resourceUrl: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi', isPrimary: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// ── UTILITY RESOLVERS ────────────────────────────────────────────────────────
export function getAllSkillDomains(): SkillDomain[] {
  return BUILTIN_SKILL_DOMAINS;
}

export function getSkillDomainById(id: string): SkillDomain | undefined {
  return BUILTIN_SKILL_DOMAINS.find(d => d.id.toLowerCase() === id.toLowerCase() || d.code.toLowerCase() === id.toLowerCase());
}

export function getAllSkills(): SkillItem[] {
  const all: SkillItem[] = [];
  for (const dom of BUILTIN_SKILL_DOMAINS) {
    for (const cat of dom.categories) {
      all.push(...cat.skills);
    }
  }
  return all;
}

export function getSkillById(id: string): SkillItem | undefined {
  const norm = id.toLowerCase().trim();
  for (const dom of BUILTIN_SKILL_DOMAINS) {
    for (const cat of dom.categories) {
      const match = cat.skills.find(s => 
        s.id.toLowerCase() === norm ||
        s.name.toLowerCase() === norm ||
        s.code.toLowerCase() === norm ||
        s.aliases?.some(a => a.toLowerCase() === norm)
      );
      if (match) return match;
    }
  }
  return undefined;
}

export function getSkillsForDepartment(departmentName: string): SkillItem[] {
  const dep = departmentName.toLowerCase();
  let domainId = 'cs_it';
  if (dep.includes('mech') || dep.includes('auto') || dep.includes('aero') || dep.includes('prod')) domainId = 'mechanical';
  else if (dep.includes('civil') || dep.includes('struct') || dep.includes('build') || dep.includes('construct')) domainId = 'civil';
  else if (dep.includes('electr') && !dep.includes('comm') && !dep.includes('ece')) domainId = 'electrical';
  else if (dep.includes('ece') || dep.includes('comm') || dep.includes('vlsi') || dep.includes('embed')) domainId = 'ece';
  else if (dep.includes('chem') || dep.includes('petro')) domainId = 'chemical';
  else if (dep.includes('pharm')) domainId = 'pharmacy';
  else if (dep.includes('manage') || dep.includes('mba') || dep.includes('bba') || dep.includes('comm')) domainId = 'management';
  else if (dep.includes('bio')) domainId = 'biotech';

  const dom = getSkillDomainById(domainId);
  if (!dom) return [];
  const skills: SkillItem[] = [];
  dom.categories.forEach(c => skills.push(...c.skills));
  return skills;
}