import { IconPoint, IconAperture, IconBoxMultiple, IconReportAnalytics, IconAlertCircle, IconMap, IconBuilding, IconTrafficLights, IconMailbox, IconAward, IconPlus, IconReport } from "@tabler/icons-react";
import { uniqueId } from "lodash";

const Menuitems = [
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
    id: uniqueId(),
    title: 'View Cases',
    icon: IconReport,
    href: '/merchant/cases',
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
      id: uniqueId(),
      title: 'Police Stations',
      subtitle: 'List of all police stations',
      icon: IconBuilding,
      href: '/merchant/police-stations',
      children: [
        {
          id: uniqueId(),
          title: 'View Station',
          icon: IconBuilding,
          href: '/merchant/police-stations',
        },
         {
          id: uniqueId(),
          title: 'Create New Station',
          icon: IconPlus,
          href: '/merchant/police-stations/create',
        },
      ],
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
