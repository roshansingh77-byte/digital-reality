import { useState } from "react";
import { useApp, type User } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Users as UsersIcon, Plus, Pencil, Trash2, Search, ShieldCheck, ShieldX } from "lucide-react";

const ROLE_OPTIONS = ["ADMIN", "ACCOUNTS", "FIELD_STAFF"];

const emptyUser = (): User => ({
  id: crypto.randomUUID(),
  name: "",
  email: "",
  role: "",
  isApproved: false,
  isAdmin: false,
});

export default function UsersPage() {
  const { user: currentUser, users, addUser, updateUser, deleteUser } = useApp();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<User>(emptyUser());
  const [passwordInput, setPasswordInput] = useState("");

  const isAdmin = currentUser?.isAdmin ?? false;

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setForm(emptyUser());
    setPasswordInput("");
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setForm({ ...u });
    setPasswordInput("");
    setEditing(u);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.role) return;
    const userToSave: User = {
      ...form,
      isAdmin: form.role.toLowerCase() === "admin",
    };
    if (editing) {
      updateUser(editing.id, userToSave);
    } else {
      addUser(userToSave);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete user "${name}"?`)) {
      deleteUser(id);
    }
  };

  const toggleApproval = (u: User) => {
    updateUser(u.id, { isApproved: !u.isApproved });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} user{users.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {search ? "No users match your search." : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "ADMIN" ? "default" : u.role === "ACCOUNTS" ? "secondary" : "outline"}>
                        {u.role || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                          <ShieldX className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.projectAssigned || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <Button variant="ghost" size="icon" onClick={() => toggleApproval(u)} title={u.isApproved ? "Revoke approval" : "Approve user"}>
                            {u.isApproved ? <ShieldX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </Button>
                        )}
                        {isAdmin && (
                          <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        {isAdmin && u.id !== currentUser?.id && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id, u.name)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update user details below." : "Fill in the details to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v, isAdmin: v === "ADMIN" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project Assigned</Label>
              <Input id="project" value={form.projectAssigned || ""} onChange={(e) => setForm({ ...form, projectAssigned: e.target.value })} placeholder="Optional: project name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
