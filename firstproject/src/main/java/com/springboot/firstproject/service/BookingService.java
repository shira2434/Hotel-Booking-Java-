package com.springboot.firstproject.service;

import com.springboot.firstproject.dto.BookingDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface BookingService {
    void add(BookingDTO booking);
    void update(BookingDTO booking);
    List<BookingDTO> getAll();
    BookingDTO getById(int id);
    List<BookingDTO> getByCustomer(int customerId);
    void cancelBooking(int id);
    double getTotalRevenue();
    Map<String, Double> getRevenueByRoomType();
    void extendBooking(int id, LocalDate newCheckOut);
    Map<String, Object> getBookingStats();
    double getCancellationRefund(int id);
    List<BookingDTO> getUpcomingCheckIns(int days);
    List<BookingDTO> getUpcomingCheckOuts(int days);
    Map<String, Object> getMonthlyReport(int year, int month);
    Map<String, Object> getTopCustomers(int limit);
    BookingDTO upgradeRoom(int bookingId);
    List<Map<String, Object>> getOccupancyByMonth(int year);
    List<Map<String, Object>> getDailyRevenue(int days);
    Map<String, Object> getRoomStats(int roomId);
}
