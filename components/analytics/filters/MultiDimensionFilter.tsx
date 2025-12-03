"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Filter, Plus, X, Save, Share2, Download, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: "AND" | "OR";
}

interface FilterGroup {
  id: string;
  conditions: FilterCondition[];
  logicOperator: "AND" | "OR";
}

interface SavedFilter {
  id: string;
  name: string;
  description: string;
  groups: FilterGroup[];
  created_at: string;
  shared: boolean;
  estimated_records: number;
}

const FILTER_FIELDS = [
  { id: "user.email", name: "User Email", type: "string", category: "User" },
  { id: "user.name", name: "User Name", type: "string", category: "User" },
  { id: "user.created_at", name: "User Signup Date", type: "date", category: "User" },
  { id: "user.total_spent", name: "Total Spent", type: "number", category: "User" },
  { id: "event.title", name: "Event Title", type: "string", category: "Event" },
  { id: "event.category", name: "Event Category", type: "string", category: "Event" },
  { id: "event.date", name: "Event Date", type: "date", category: "Event" },
  { id: "ticket.price", name: "Ticket Price", type: "number", category: "Ticket" },
  { id: "ticket.status", name: "Ticket Status", type: "string", category: "Ticket" },
  { id: "payment.amount", name: "Payment Amount", type: "number", category: "Payment" },
  { id: "payment.status", name: "Payment Status", type: "string", category: "Payment" },
];

const OPERATORS = {
  string: [
    { id: "equals", name: "Equals" },
    { id: "not_equals", name: "Not Equals" },
    { id: "contains", name: "Contains" },
    { id: "starts_with", name: "Starts With" },
    { id: "ends_with", name: "Ends With" },
  ],
  number: [
    { id: "equals", name: "Equals" },
    { id: "not_equals", name: "Not Equals" },
    { id: "greater_than", name: "Greater Than" },
    { id: "less_than", name: "Less Than" },
    { id: "between", name: "Between" },
  ],
  date: [
    { id: "equals", name: "On Date" },
    { id: "before", name: "Before" },
    { id: "after", name: "After" },
    { id: "between", name: "Between" },
    { id: "last_7_days", name: "Last 7 Days" },
    { id: "last_30_days", name: "Last 30 Days" },
    { id: "this_month", name: "This Month" },
    { id: "this_year", name: "This Year" },
  ],
};

export const MultiDimensionFilter = ({ onApply }: { onApply?: (groups: FilterGroup[]) => void }) => {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    {
      id: "group-1",
      logicOperator: "AND",
      conditions: [
        {
          id: "condition-1",
          field: "",
          operator: "",
          value: "",
        },
      ],
    },
  ]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["group-1"]));

  const addCondition = (groupId: string) => {
    setFilterGroups(
      filterGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: [
                ...group.conditions,
                {
                  id: `condition-${Date.now()}`,
                  field: "",
                  operator: "",
                  value: "",
                  logicOperator: "AND",
                },
              ],
            }
          : group
      )
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setFilterGroups(
      filterGroups
        .map((group) =>
          group.id === groupId
            ? {
                ...group,
                conditions: group.conditions.filter((c) => c.id !== conditionId),
              }
            : group
        )
        .filter((group) => group.conditions.length > 0)
    );
  };

  const updateCondition = (groupId: string, conditionId: string, field: keyof FilterCondition, value: any) => {
    setFilterGroups(
      filterGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === conditionId ? { ...condition, [field]: value } : condition
              ),
            }
          : group
      )
    );
  };

  const addGroup = () => {
    const newGroupId = `group-${Date.now()}`;
    setFilterGroups([
      ...filterGroups,
      {
        id: newGroupId,
        logicOperator: "OR",
        conditions: [
          {
            id: `condition-${Date.now()}`,
            field: "",
            operator: "",
            value: "",
          },
        ],
      },
    ]);
    setExpandedGroups(new Set([...expandedGroups, newGroupId]));
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const applyFilters = async () => {
    // Validate all conditions
    const hasEmptyConditions = filterGroups.some((group) =>
      group.conditions.some((c) => !c.field || !c.operator || !c.value)
    );

    if (hasEmptyConditions) {
      toast.error("Please fill in all filter conditions");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/analytics/filters/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filterGroups }),
      });

      if (!response.ok) throw new Error("Failed to apply filters");

      const data = await response.json();
      toast.success(`Filter applied: ${data.recordCount} records match`);
      onApply?.(filterGroups);
    } catch (err) {
      toast.error("Failed to apply filters");
    }
  };

  const saveFilter = async () => {
    if (!filterName.trim()) {
      toast.error("Please enter a filter name");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/analytics/filters/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: filterName,
          description: filterDescription,
          groups: filterGroups,
        }),
      });

      if (!response.ok) throw new Error("Failed to save filter");

      const data = await response.json();
      setSavedFilters([...savedFilters, data.filter]);
      toast.success("Filter saved successfully");
      setShowSaveDialog(false);
      setFilterName("");
      setFilterDescription("");
    } catch (err) {
      toast.error("Failed to save filter");
    }
  };

  const loadFilter = (filter: SavedFilter) => {
    setFilterGroups(filter.groups);
    setExpandedGroups(new Set(filter.groups.map((g) => g.id)));
    setShowLoadDialog(false);
    toast.success(`Loaded filter: ${filter.name}`);
  };

  const getFieldType = (fieldId: string) => {
    return FILTER_FIELDS.find((f) => f.id === fieldId)?.type || "string";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" style={{ color: "#08CB00" }} />
                Advanced Multi-Dimension Filter
              </CardTitle>
              <CardDescription>Build complex queries with nested AND/OR logic</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowLoadDialog(true)}>
                <Download className="h-4 w-4 mr-2" />
                Load
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {filterGroups.map((group, groupIndex) => (
                <div key={group.id}>
                  {groupIndex > 0 && (
                    <div className="flex items-center justify-center my-4">
                      <Badge
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() =>
                          setFilterGroups(
                            filterGroups.map((g, i) =>
                              i === groupIndex ? { ...g, logicOperator: g.logicOperator === "AND" ? "OR" : "AND" } : g
                            )
                          )
                        }
                      >
                        {group.logicOperator}
                      </Badge>
                    </div>
                  )}

                  <Card className="border-2" style={{ borderColor: expandedGroups.has(group.id) ? "#08CB00" : "" }}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroup(group.id)}
                            className="p-0 h-auto"
                          >
                            {expandedGroups.has(group.id) ? (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-semibold">
                              Group {groupIndex + 1} ({group.conditions.length} conditions)
                            </span>
                          </Button>
                          {filterGroups.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setFilterGroups(filterGroups.filter((g) => g.id !== group.id))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {expandedGroups.has(group.id) && (
                          <div className="space-y-3 pl-4">
                            {group.conditions.map((condition, conditionIndex) => {
                              const fieldType = getFieldType(condition.field);
                              const operators = OPERATORS[fieldType as keyof typeof OPERATORS] || OPERATORS.string;

                              return (
                                <div key={condition.id}>
                                  {conditionIndex > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <Select
                                        value={condition.logicOperator}
                                        onValueChange={(value) =>
                                          updateCondition(group.id, condition.id, "logicOperator", value)
                                        }
                                      >
                                        <SelectTrigger className="w-24">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="AND">AND</SelectItem>
                                          <SelectItem value="OR">OR</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={condition.field}
                                      onValueChange={(value) => updateCondition(group.id, condition.id, "field", value)}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select field" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(
                                          FILTER_FIELDS.reduce((acc, field) => {
                                            if (!acc[field.category]) acc[field.category] = [];
                                            acc[field.category].push(field);
                                            return acc;
                                          }, {} as Record<string, typeof FILTER_FIELDS>)
                                        ).map(([category, fields]) => (
                                          <div key={category}>
                                            <div className="px-2 py-1.5 text-sm font-semibold">{category}</div>
                                            {fields.map((field) => (
                                              <SelectItem key={field.id} value={field.id}>
                                                {field.name}
                                              </SelectItem>
                                            ))}
                                          </div>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={condition.operator}
                                      onValueChange={(value) =>
                                        updateCondition(group.id, condition.id, "operator", value)
                                      }
                                      disabled={!condition.field}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Operator" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {operators.map((op) => (
                                          <SelectItem key={op.id} value={op.id}>
                                            {op.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <Input
                                      placeholder="Value"
                                      value={condition.value}
                                      onChange={(e) => updateCondition(group.id, condition.id, "value", e.target.value)}
                                      disabled={!condition.operator}
                                      className="flex-1"
                                      type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
                                    />

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeCondition(group.id, condition.id)}
                                      disabled={group.conditions.length === 1}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addCondition(group.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Condition
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Button variant="outline" onClick={addGroup} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
            <Button onClick={applyFilters} className="flex-1" style={{ backgroundColor: "#08CB00" }}>
              Apply Filters
            </Button>
          </div>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Filter Performance</p>
                <p className="text-muted-foreground">
                  Complex filters may take longer to execute. Consider saving frequently used filters.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Save Filter Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Set</DialogTitle>
            <DialogDescription>Save this filter configuration for future use</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                placeholder="e.g., High-Value Customers"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Description (Optional)</Label>
              <Input
                id="filter-description"
                placeholder="What does this filter do?"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveFilter} style={{ backgroundColor: "#08CB00" }}>
              Save Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Filter Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Saved Filter</DialogTitle>
            <DialogDescription>Choose from your saved filter configurations</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {savedFilters.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No saved filters yet</p>
                </div>
              ) : (
                savedFilters.map((filter) => (
                  <Card
                    key={filter.id}
                    className="cursor-pointer hover:border-primary"
                    onClick={() => loadFilter(filter)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{filter.name}</h3>
                            {filter.shared && (
                              <Badge variant="outline">
                                <Share2 className="h-3 w-3 mr-1" />
                                Shared
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{filter.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{filter.groups.length} groups</span>
                            <span>•</span>
                            <span>~{filter.estimated_records.toLocaleString()} records</span>
                            <span>•</span>
                            <span>{new Date(filter.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
