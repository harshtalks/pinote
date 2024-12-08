// Key Value List after title input in the notebook.

import { LucideIcon } from "@/types/*";
import { Calendar, CalendarSearch, Link } from "lucide-react";

export type KeyValue = {
  key: string;
  value: string;
  icon: LucideIcon;
};

export const keyvalues: KeyValue[] = [
  {
    key: "Created",
    value: "01/15/2024 11:29:23 AM",
    icon: Calendar,
  },
  {
    key: "Url",
    icon: Link,
    value: "https://google.com/ahss/sdnksd",
  },
  {
    key: "Updated",
    icon: CalendarSearch,
    value: "01/15/2024 11:29:23 AM",
  },
];

export const KeyValue = ({ keyvalues }: { keyvalues: KeyValue[] }) => {
  return (
    <table className="w-full text-sm">
      <tbody className="space-y-4">
        {keyvalues.map((kv) => (
          <tr key={kv.key} className="grid grid-cols-2 items-center">
            <td className="text-neutral-400 font-medium flex items-center gap-2">
              <kv.icon size={20} /> {kv.key}
            </td>
            <td className="font-semibold">{kv.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};