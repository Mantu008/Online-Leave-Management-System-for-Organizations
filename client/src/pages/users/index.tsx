import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import userService, { User, CreateUserDto, UpdateUserDto } from '../../services/userService';
import notificationService from '../../services/notificationService';

// Update roles to match backend enum values
const roles = ['employee', 'manager', 'admin'];
const departments = ['IT', 'HR', 'Finance', 'Operations', 'Marketing'];
const positions = ['Employee', 'Senior Employee', 'Team Lead', 'Manager', 'Senior Manager', 'Director'];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    position: '',
    password: '',
    joiningDate: new Date().toISOString().split('T')[0], // Default to today
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    { field: 'department', headerName: 'Department', flex: 1 },
    { field: 'position', headerName: 'Position', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params: { row: User }) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleOpen = () => {
    setOpen(true);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      position: '',
      password: '',
      joiningDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      password: '',
      joiningDate: new Date(user.joiningDate).toISOString().split('T')[0],
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      setUsers(users.filter(user => user._id !== id));
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error deleting user', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        const updateData: UpdateUserDto = {
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          department: formData.department,
          position: formData.position,
          joiningDate: formData.joiningDate,
        };
        const updatedUser = await userService.updateUser(selectedUser._id, updateData);
        const mappedUser = {
          ...updatedUser,
          id: updatedUser._id,
          status: updatedUser.isActive ? 'Active' : 'Inactive'
        };
        setUsers(users.map(user => user._id === selectedUser._id ? mappedUser : user));
        enqueueSnackbar('User updated successfully', { variant: 'success' });
      } else {
        const createData: CreateUserDto = {
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          department: formData.department,
          position: formData.position,
          password: formData.password,
          joiningDate: formData.joiningDate,
        };
        const newUser = await userService.createUser(createData);
        const mappedUser = {
          ...newUser,
          id: newUser._id,
          status: newUser.isActive ? 'Active' : 'Inactive'
        };
        setUsers([...users, mappedUser]);
        
        // Emit user created notification
        notificationService.emitUserCreated({
          userId: newUser._id,
          name: newUser.name,
          role: newUser.role,
          department: newUser.department
        });
        
        enqueueSnackbar('User created successfully', { variant: 'success' });
      }
      handleClose();
    } catch (error) {
      enqueueSnackbar('Error saving user', { variant: 'error' });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        const usersWithId = data.map(user => ({
          ...user,
          id: user._id,
          status: user.isActive ? 'Active' : 'Inactive'
        }));
        setUsers(usersWithId);
      } catch (error) {
        enqueueSnackbar('Error fetching users', { variant: 'error' });
      }
    };
    fetchUsers();
  }, [enqueueSnackbar]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            {!selectedUser && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              >
                {positions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Joining Date"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData({ ...formData, joiningDate: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage; 