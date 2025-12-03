"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Calendar,
} from "lucide-react";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface UserDataTableProps {
  users: User[];
  isLoading?: boolean;
  onEdit: (user: User) => void;
  onRefresh: () => void;
}

export function UserDataTable({ users, isLoading, onEdit, onRefresh }: UserDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: "activate" | "suspend" | "delete" | null;
  }>({ open: false, action: null });

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue("email")}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.firstName} {row.original.lastName}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          const roleColors = {
            SUPER_ADMIN: "bg-purple-500/10 text-purple-700 border-purple-500/20",
            ADMIN: "bg-blue-500/10 text-blue-700 border-blue-500/20",
            MODERATOR: "bg-green-500/10 text-green-700 border-green-500/20",
            ORGANIZER: "bg-orange-500/10 text-orange-700 border-orange-500/20",
            ATTENDEE: "bg-gray-500/10 text-gray-700 border-gray-500/20",
          };
          return (
            <Badge variant="outline" className={roleColors[role as keyof typeof roleColors] || ""}>
              {role}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          const isVerified = row.original.isEmailVerified;
          return (
            <div className="flex flex-col gap-1">
              <Badge variant={isActive ? "default" : "secondary"} className="w-fit">
                {isActive ? "Active" : "Suspended"}
              </Badge>
              {!isVerified && (
                <Badge variant="outline" className="w-fit text-orange-600 border-orange-500/20">
                  Unverified
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return <div className="text-sm">{date.toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last Login",
        cell: ({ row }) => {
          const lastLogin = row.getValue("lastLoginAt") as string | null;
          if (!lastLogin) return <span className="text-muted-foreground text-sm">Never</span>;
          const date = new Date(lastLogin);
          return <div className="text-sm">{date.toLocaleDateString()}</div>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(user)}>Edit User</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewActivity(user.id)}>View Activity</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                  {user.isActive ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Suspend User
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate User
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkAction = (action: "activate" | "suspend" | "delete") => {
    setBulkActionDialog({ open: true, action });
  };

  const executeBulkAction = async () => {
    if (!bulkActionDialog.action) return;

    const selectedUsers = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

    // TODO: Implement API call for bulk actions
    toast.success(`${bulkActionDialog.action} action applied to ${selectedUsers.length} users`);

    setBulkActionDialog({ open: false, action: null });
    setRowSelection({});
    onRefresh();
  };

  const handleToggleStatus = async (user: User) => {
    // TODO: Implement API call
    toast.success(`User ${user.isActive ? "suspended" : "activated"} successfully`);
    onRefresh();
  };

  const handleDeleteUser = async (userId: string) => {
    // TODO: Implement API call with confirmation
    toast.success("User deleted successfully");
    onRefresh();
  };

  const handleViewActivity = (userId: string) => {
    // Navigate to activity log
    window.location.href = `/admin/users/${userId}/activity`;
  };

  const handleExportCSV = () => {
    const csv = [
      ["Email", "Name", "Role", "Status", "Created", "Last Login"],
      ...users.map((user) => [
        user.email,
        `${user.firstName || ""} ${user.lastName || ""}`,
        user.role,
        user.isActive ? "Active" : "Suspended",
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Users exported successfully");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => table.getColumn("role")?.setFilterValue(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MODERATOR">Moderator</SelectItem>
            <SelectItem value="ORGANIZER">Organizer</SelectItem>
            <SelectItem value="ATTENDEE">Attendee</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleExportCSV} variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
              <UserCheck className="mr-2 h-4 w-4" />
              Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("suspend")}>
              <UserX className="mr-2 h-4 w-4" />
              Suspend
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkActionDialog.open} onOpenChange={(open: any) => setBulkActionDialog({ open, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkActionDialog.action} {selectedCount} selected user(s)? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialog({ open: false, action: null })}>
              Cancel
            </Button>
            <Button
              variant={bulkActionDialog.action === "delete" ? "destructive" : "default"}
              onClick={executeBulkAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
