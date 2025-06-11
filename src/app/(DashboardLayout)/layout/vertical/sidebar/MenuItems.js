import { uniqueId } from 'lodash';

import {
  IconAward,
  IconBoxMultiple,
  IconPoint,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconAperture,
  IconAnalyze,
  IconReport,
  IconReportAnalytics,
  IconEmergencyBed,
  IconAlertCircle,
  IconMap,
  IconBuilding,
  IconPlus,
  IconMailbox,
  IconTrafficLights,
} from '@tabler/icons-react';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconAperture,
    href: '/merchant',
    chip: 'New',
    chipColor: 'secondary',
  },
  {
    id: uniqueId(),
    title: 'Analytics',
    icon: IconReportAnalytics,
    href: '/merchant/analytics',
  },

  {
    navlabel: true,
    subheader: 'Case Management',
  },
  {
    id: uniqueId(),
    title: 'View Cases',
    icon: IconReport,
    href: '/merchant/cases',
    // children: [
    //   {
    //     id: uniqueId(),
    //     title: 'Level 1',
    //     icon: IconPoint,
    //     href: '/l1',
    //   },
    //   {
    //     id: uniqueId(),
    //     title: 'Level 1.1',
    //     icon: IconPoint,
    //     href: '/l1.1',
    //     children: [
    //       {
    //         id: uniqueId(),
    //         title: 'Level 2',
    //         icon: IconPoint,
    //         href: '/l2',
    //       },
    //       {
    //         id: uniqueId(),
    //         title: 'Level 2.1',
    //         icon: IconPoint,
    //         href: '/l2.1',
    //         children: [
    //           {
    //             id: uniqueId(),
    //             title: 'Level 3',
    //             icon: IconPoint,
    //             href: '/l3',
    //           },
    //           {
    //             id: uniqueId(),
    //             title: 'Level 3.1',
    //             icon: IconPoint,
    //             href: '/l3.1',
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
  },
  {
    id: uniqueId(),
    title: 'SOS Reports',
    icon: IconAlertCircle,
    href: '/merchant/cases?type=sos',
  },
    {
    id: uniqueId(),
    title: 'Map Overview',
    icon: IconMap,
    href: '/merchant/map-view',
  },
  {
    navlabel: true,
    subheader: 'Station Management',
  },
  {
    id: uniqueId(),
    title: 'Police Stations',
    subtitle: 'List of all police stations',
    icon: IconBuilding,
    href: '/police-stations',
    children: [
      {
        id: uniqueId(),
        title: 'View Station',
        icon: IconBuilding,
        href: '/police-stations',
      },
       {
        id: uniqueId(),
        title: 'Create New Station',
        icon: IconPlus,
        href: '/police-stations/create',
      },
    ],
  },
  {
    navlabel: true,
    subheader: 'Public Services',
  },
  {
    id: uniqueId(),
    title: 'Publications',
    icon: IconAward,
    href: '/merchant/publications',
    chipColor: 'primary',
  },
    {
    id: uniqueId(),
    title: 'Suggestion Box',
    icon: IconMailbox,
    href: '/merchant/suggestion-box',
    chipColor: 'primary',
  },
     {
    id: uniqueId(),
    title: 'Traffic Violations',
    icon: IconTrafficLights,
    href: '/merchant/traffic-violations',
  }
];

export default Menuitems;
