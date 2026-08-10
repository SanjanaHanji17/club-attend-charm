import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEPARTMENT_HELP,
  DEPARTMENT_OTHER_HELP,
  DEPARTMENTS,
  isStandardDepartment,
  normalizeDepartment,
} from "@/lib/departments";

/**
 * Department picker: standard short codes + "Other" free text.
 * Existing non-standard values are preserved and pre-selected as "Other".
 */
export function DepartmentField({
  value,
  onChange,
  label = "Department",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const standard = isStandardDepartment(value);
  const [mode, setMode] = useState<string>(value ? (standard ? normalizeDepartment(value) : "Other") : "");
  const [custom, setCustom] = useState(standard ? "" : value || "");

  useEffect(() => {
    if (!value) return;
    if (isStandardDepartment(value)) {
      setMode(normalizeDepartment(value));
      setCustom("");
    } else {
      setMode("Other");
      setCustom(value);
    }
    // only sync when an external value arrives/changes
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={mode}
        onValueChange={(v) => {
          setMode(v);
          if (v === "Other") onChange(normalizeDepartment(custom));
          else onChange(v);
        }}
      >
        <SelectTrigger className="glass">
          <SelectValue placeholder="Select department" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((d) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-[11px] text-muted-foreground">{DEPARTMENT_HELP}</p>
      {mode === "Other" && (
        <div className="pt-1 space-y-1.5">
          <Input
            className="glass"
            placeholder="e.g. MCA"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              onChange(normalizeDepartment(e.target.value));
            }}
          />
          <p className="text-[11px] text-muted-foreground">{DEPARTMENT_OTHER_HELP}</p>
        </div>
      )}
    </div>
  );
}
