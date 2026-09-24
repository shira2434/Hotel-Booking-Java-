import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Rooms
export const getAllRooms = () => axios.get(`${BASE}/rooms/getAll`);
export const addRoom = (room) => axios.post(`${BASE}/rooms/add`, room);
export const updateRoom = (room) => axios.put(`${BASE}/rooms/update`, room);
export const deleteRoom = (id) => axios.delete(`${BASE}/rooms/delete/${id}`);
export const getAvailableRooms = (checkIn, checkOut) =>
  axios.get(`${BASE}/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`);

// Customers
export const getAllCustomers = () => axios.get(`${BASE}/customers/getAll`);
export const addCustomer = (c) => axios.post(`${BASE}/customers/add`, c);
export const updateCustomer = (c) => axios.put(`${BASE}/customers/update`, c);
export const deleteCustomer = (id) => axios.delete(`${BASE}/customers/delete/${id}`);
export const registerCustomer = (c) => axios.post(`${BASE}/customers/register`, c);
export const loginCustomer = (email, password) => axios.post(`${BASE}/customers/login`, null, { params: { email, password } });
export const adminLogin = (username, password) => axios.post(`${BASE}/admin/login`, null, { params: { username, password } });
export const getVipCustomers = () => axios.get(`${BASE}/customers/vip`);
export const getCustomerProfile = (id) => axios.get(`${BASE}/customers/profile/${id}`);

// Bookings
export const getAllBookings = () => axios.get(`${BASE}/bookings/getAll`);
export const addBooking = (b) => axios.post(`${BASE}/bookings/add`, b);
export const cancelBooking = (id) => axios.put(`${BASE}/bookings/cancel/${id}`);
export const getTotalRevenue = () => axios.get(`${BASE}/bookings/totalRevenue`);
export const getRevenueByRoomType = () => axios.get(`${BASE}/bookings/revenueByRoomType`);
export const extendBooking = (id, newCheckOut) =>
  axios.put(`${BASE}/bookings/extend/${id}?newCheckOut=${newCheckOut}`);
export const getBookingStats = () => axios.get(`${BASE}/bookings/stats`);
export const getUpcomingCheckIns = (days = 7) => axios.get(`${BASE}/bookings/upcoming/checkIns?days=${days}`);
export const getUpcomingCheckOuts = (days = 7) => axios.get(`${BASE}/bookings/upcoming/checkOuts?days=${days}`);
export const getTopCustomers = (limit = 5) => axios.get(`${BASE}/bookings/topCustomers?limit=${limit}`);
export const upgradeRoom = (id) => axios.put(`${BASE}/bookings/upgrade/${id}`);
export const getMonthlyReport = (year, month) => axios.get(`${BASE}/bookings/report/monthly?year=${year}&month=${month}`);
export const getOccupancyByMonth = (year) => axios.get(`${BASE}/bookings/occupancyByMonth?year=${year}`);
export const getDailyRevenue = (days = 14) => axios.get(`${BASE}/bookings/dailyRevenue?days=${days}`);
export const getRoomStats = (roomId) => axios.get(`${BASE}/bookings/roomStats/${roomId}`);
export const getCancellationRefund = (id) => axios.get(`${BASE}/bookings/refund/${id}`);
