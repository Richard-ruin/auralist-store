// src/hooks/useUsers.js
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useUserContext } from '../context/UserContext';
import { getUsers, getUserStats, createUser, updateUser, deleteUser } from '../services/users';

export const useUsers = () => {
  const { state, dispatch } = useUserContext();

  const fetchUsers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = {
        page: state.currentPage,
        limit: 10,
        search: state.searchTerm
      };
      
      const response = await getUsers(params);
      dispatch({ type: 'SET_USERS', payload: response.data.users });
      dispatch({ type: 'SET_TOTAL_PAGES', payload: Math.ceil(response.total / 10) });
    } catch (error) {
      toast.error('Failed to fetch users');
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPage, state.searchTerm, dispatch]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getUserStats();
      dispatch({ type: 'SET_STATS', payload: response.data });
    } catch (error) {
      toast.error('Failed to fetch user statistics');
    }
  }, [dispatch]);

  const addUser = async (userData) => {
    try {
      await createUser(userData);
      toast.success('User created successfully');
      await fetchUsers();
      await fetchStats();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
      return false;
    }
  };

  const editUser = async (id, userData) => {
    try {
      await updateUser(id, userData);
      toast.success('User updated successfully');
      await fetchUsers();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      return false;
    }
  };

  const removeUser = async (id) => {
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      await fetchUsers();
      await fetchStats();
      return true;
    } catch (error) {
      toast.error('Failed to delete user');
      return false;
    }
  };

  const setSearchTerm = (term) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    dispatch({ type: 'SET_PAGE', payload: 1 });
  };

  const setPage = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  return {
    users: state.users,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    searchTerm: state.searchTerm,
    fetchUsers,
    fetchStats,
    addUser,
    editUser,
    removeUser,
    setSearchTerm,
    setPage
  };
};