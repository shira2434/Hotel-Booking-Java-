package com.springboot.firstproject.controller;

import com.springboot.firstproject.dto.BookingDTO;
import com.springboot.firstproject.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired private BookingService bs;

    @GetMapping("/getAll")
    public List<BookingDTO> getAll() { return bs.getAll(); }

    @PostMapping("/add")
    public void add(@RequestBody BookingDTO booking) { bs.add(booking); }

    @PutMapping("/update")
    public void update(@RequestBody BookingDTO booking) { bs.update(booking); }

    @GetMapping("/getById/{id}")
    public BookingDTO getById(@PathVariable int id) { return bs.getById(id); }

    @GetMapping("/getByCustomer/{customerId}")
    public List<BookingDTO> getByCustomer(@PathVariable int customerId) { return bs.getByCustomer(customerId); }

    @PutMapping("/cancel/{id}")
    public void cancelBooking(@PathVariable int id) { bs.cancelBooking(id); }

    @GetMapping("/totalRevenue")
    public double getTotalRevenue() { return bs.getTotalRevenue(); }

    @GetMapping("/revenueByRoomType")
    public Map<String, Double> getRevenueByRoomType() { return bs.getRevenueByRoomType(); }

    @PutMapping("/extend/{id}")
    public void extendBooking(@PathVariable int id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newCheckOut) {
        bs.extendBooking(id, newCheckOut);
    }

    @GetMapping("/stats")
    public Map<String, Object> getBookingStats() { return bs.getBookingStats(); }

    @GetMapping("/refund/{id}")
    public double getCancellationRefund(@PathVariable int id) { return bs.getCancellationRefund(id); }

    @GetMapping("/upcoming/checkIns")
    public List<BookingDTO> getUpcomingCheckIns(@RequestParam(defaultValue = "7") int days) {
        return bs.getUpcomingCheckIns(days);
    }

    @GetMapping("/upcoming/checkOuts")
    public List<BookingDTO> getUpcomingCheckOuts(@RequestParam(defaultValue = "7") int days) {
        return bs.getUpcomingCheckOuts(days);
    }

    @GetMapping("/report/monthly")
    public Map<String, Object> getMonthlyReport(@RequestParam int year, @RequestParam int month) {
        return bs.getMonthlyReport(year, month);
    }

    @GetMapping("/topCustomers")
    public Map<String, Object> getTopCustomers(@RequestParam(defaultValue = "5") int limit) {
        return bs.getTopCustomers(limit);
    }

    @PutMapping("/upgrade/{id}")
    public BookingDTO upgradeRoom(@PathVariable int id) { return bs.upgradeRoom(id); }

    @GetMapping("/occupancyByMonth")
    public List<Map<String, Object>> getOccupancyByMonth(@RequestParam int year) {
        return bs.getOccupancyByMonth(year);
    }

    @GetMapping("/dailyRevenue")
    public List<Map<String, Object>> getDailyRevenue(@RequestParam(defaultValue = "14") int days) {
        return bs.getDailyRevenue(days);
    }

    @GetMapping("/roomStats/{roomId}")
    public Map<String, Object> getRoomStats(@PathVariable int roomId) {
        return bs.getRoomStats(roomId);
    }
}
