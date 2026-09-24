package com.springboot.firstproject.service;

import com.springboot.firstproject.dto.BookingDTO;
import com.springboot.firstproject.entity.Booking;
import com.springboot.firstproject.entity.Customer;
import com.springboot.firstproject.entity.Room;
import com.springboot.firstproject.repository.BookingRepository;
import com.springboot.firstproject.repository.CustomerRepository;
import com.springboot.firstproject.repository.RoomRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private static final int MIN_NIGHTS = 1;
    private static final int MAX_ACTIVE_BOOKINGS_PER_CUSTOMER = 5;

    @Autowired private BookingRepository br;
    @Autowired private CustomerRepository cr;
    @Autowired private RoomRepository rr;
    @Autowired private ModelMapper mapper;

    private double getSeasonMultiplier(LocalDate date) {
        return switch (date.getMonth()) {
            case JULY, AUGUST, DECEMBER -> 1.4;
            case JUNE, SEPTEMBER, JANUARY -> 1.2;
            case MARCH, APRIL, MAY -> 1.1;
            default -> 1.0;
        };
    }

    private String getVipTier(int customerId) {
        long count = br.findByCustomerId(customerId).stream().filter(b -> !b.isCancelled()).count();
        if (count >= 10) return "GOLD";
        if (count >= 5)  return "SILVER";
        if (count >= 3)  return "BRONZE";
        return "NONE";
    }

    private double getVipDiscount(String tier) {
        return switch (tier) {
            case "GOLD"   -> 0.80;
            case "SILVER" -> 0.88;
            case "BRONZE" -> 0.93;
            default       -> 1.0;
        };
    }

    private double calculatePrice(Room room, LocalDate checkIn, LocalDate checkOut, int customerId) {
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        double base = nights * room.getPricePerNight();
        double seasonal = base * getSeasonMultiplier(checkIn);
        double discount = getVipDiscount(getVipTier(customerId));
        return Math.round(seasonal * discount * 100.0) / 100.0;
    }

    @Override
    public double getCancellationRefund(int id) {
        Booking b = br.findById(id).orElseThrow(() -> new RuntimeException("Booking not found!"));
        if (b.isCancelled()) throw new RuntimeException("Booking is already cancelled!");
        long daysUntilCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), b.getCheckIn());
        double totalPrice = calculatePrice(b.getRoom(), b.getCheckIn(), b.getCheckOut(), b.getCustomer().getId());
        if (daysUntilCheckIn > 7)  return totalPrice;
        if (daysUntilCheckIn >= 3) return Math.round(totalPrice * 0.5 * 100.0) / 100.0;
        return 0.0;
    }

    @Override
    @Transactional
    public void add(BookingDTO dto) {
        Customer customer = cr.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found!"));
        Room room = rr.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found!"));

        long nights = ChronoUnit.DAYS.between(dto.getCheckIn(), dto.getCheckOut());
        if (nights < MIN_NIGHTS)
            throw new RuntimeException("Minimum stay is " + MIN_NIGHTS + " night(s)!");

        if (dto.getGuestsCount() > 0 && room.getMaxGuests() > 0 && dto.getGuestsCount() > room.getMaxGuests())
            throw new RuntimeException("Room capacity is " + room.getMaxGuests() + " guests!");

        long activeCount = br.findByCustomerId(dto.getCustomerId()).stream()
                .filter(b -> !b.isCancelled()).count();
        if (activeCount >= MAX_ACTIVE_BOOKINGS_PER_CUSTOMER)
            throw new RuntimeException("Customer has reached the maximum of " + MAX_ACTIVE_BOOKINGS_PER_CUSTOMER + " active bookings!");

        boolean roomTaken = br.findByCancelledFalse().stream().anyMatch(b ->
                b.getRoom().getId() == room.getId() &&
                b.getCheckIn().isBefore(dto.getCheckOut()) &&
                b.getCheckOut().isAfter(dto.getCheckIn()));
        if (roomTaken)
            throw new RuntimeException("Room is not available for selected dates!");

        double price = calculatePrice(room, dto.getCheckIn(), dto.getCheckOut(), customer.getId());

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setRoom(room);
        booking.setCheckIn(dto.getCheckIn());
        booking.setCheckOut(dto.getCheckOut());
        booking.setCancelled(false);
        booking.setGuestsCount(dto.getGuestsCount() > 0 ? dto.getGuestsCount() : 1);
        booking.setNotes(dto.getNotes());
        booking.setTotalPrice(price);
        booking.setId(0);
        br.save(booking);
    }

    @Override
    @Transactional
    public void update(BookingDTO dto) {
        Booking booking = br.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
        booking.setCheckIn(dto.getCheckIn());
        booking.setCheckOut(dto.getCheckOut());
        booking.setNotes(dto.getNotes());
        booking.setGuestsCount(dto.getGuestsCount());
        booking.setTotalPrice(calculatePrice(booking.getRoom(), dto.getCheckIn(), dto.getCheckOut(), booking.getCustomer().getId()));
        br.save(booking);
    }

    @Override
    public List<BookingDTO> getAll() {
        return br.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public BookingDTO getById(int id) {
        return toDTO(br.findById(id).orElseThrow());
    }

    @Override
    public List<BookingDTO> getByCustomer(int customerId) {
        return br.findByCustomerId(customerId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public void cancelBooking(int id) {
        Booking booking = br.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
        if (booking.isCancelled())
            throw new RuntimeException("Booking is already cancelled!");
        if (!LocalDate.now().isBefore(booking.getCheckIn()))
            throw new RuntimeException("Cannot cancel after check-in date!");
        booking.setCancelled(true);
        br.save(booking);
    }

    @Override
    public double getTotalRevenue() {
        return br.findByCancelledFalse().stream()
                .mapToDouble(Booking::getTotalPrice)
                .sum();
    }

    @Override
    public Map<String, Double> getRevenueByRoomType() {
        Map<String, Double> result = new LinkedHashMap<>();
        for (Booking b : br.findByCancelledFalse())
            result.merge(b.getRoom().getType(), b.getTotalPrice(), Double::sum);
        return result;
    }

    @Override
    @Transactional
    public void extendBooking(int id, LocalDate newCheckOut) {
        Booking booking = br.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
        if (booking.isCancelled())
            throw new RuntimeException("Cannot extend a cancelled booking!");
        if (!newCheckOut.isAfter(booking.getCheckOut()))
            throw new RuntimeException("New check-out must be after current check-out!");
        boolean conflict = br.findByCancelledFalse().stream().anyMatch(b ->
                b.getId() != id &&
                b.getRoom().getId() == booking.getRoom().getId() &&
                b.getCheckIn().isBefore(newCheckOut) &&
                b.getCheckOut().isAfter(booking.getCheckOut()));
        if (conflict)
            throw new RuntimeException("Room is not available for the extended period!");
        booking.setCheckOut(newCheckOut);
        booking.setTotalPrice(calculatePrice(booking.getRoom(), booking.getCheckIn(), newCheckOut, booking.getCustomer().getId()));
        br.save(booking);
    }

    @Override
    public List<BookingDTO> getUpcomingCheckIns(int days) {
        LocalDate today = LocalDate.now();
        LocalDate until = today.plusDays(days);
        return br.findByCancelledFalse().stream()
                .filter(b -> !b.getCheckIn().isBefore(today) && !b.getCheckIn().isAfter(until))
                .sorted(Comparator.comparing(Booking::getCheckIn))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO> getUpcomingCheckOuts(int days) {
        LocalDate today = LocalDate.now();
        LocalDate until = today.plusDays(days);
        return br.findByCancelledFalse().stream()
                .filter(b -> !b.getCheckOut().isBefore(today) && !b.getCheckOut().isAfter(until))
                .sorted(Comparator.comparing(Booking::getCheckOut))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getMonthlyReport(int year, int month) {
        Month m = Month.of(month);
        List<Booking> monthly = br.findAll().stream()
                .filter(b -> b.getCheckIn().getYear() == year && b.getCheckIn().getMonth() == m)
                .collect(Collectors.toList());

        List<Booking> active = monthly.stream().filter(b -> !b.isCancelled()).collect(Collectors.toList());
        double revenue = active.stream().mapToDouble(Booking::getTotalPrice).sum();
        double avgNights = active.stream()
                .mapToLong(b -> ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut()))
                .average().orElse(0);
        Map<String, Long> byType = active.stream()
                .collect(Collectors.groupingBy(b -> b.getRoom().getType(), Collectors.counting()));

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("year", year);
        report.put("month", MONTH_NAMES_FULL[month]);
        report.put("totalBookings", monthly.size());
        report.put("activeBookings", active.size());
        report.put("cancelledBookings", monthly.size() - active.size());
        report.put("revenue", Math.round(revenue * 100.0) / 100.0);
        report.put("averageNights", Math.round(avgNights * 10.0) / 10.0);
        report.put("bookingsByRoomType", byType);
        return report;
    }

    @Override
    public Map<String, Object> getTopCustomers(int limit) {
        Map<Integer, Double> revenueByCustomer = new HashMap<>();
        for (Booking b : br.findByCancelledFalse())
            revenueByCustomer.merge(b.getCustomer().getId(), b.getTotalPrice(), Double::sum);

        List<Map<String, Object>> top = revenueByCustomer.entrySet().stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                .limit(limit)
                .map(e -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    cr.findById(e.getKey()).ifPresent(c -> {
                        entry.put("customerId", c.getId());
                        entry.put("name", c.getFullName());
                        entry.put("email", c.getEmail());
                        entry.put("totalSpent", Math.round(e.getValue() * 100.0) / 100.0);
                        entry.put("vipTier", getVipTier(c.getId()));
                        entry.put("totalBookings", br.findByCustomerId(c.getId()).stream().filter(b -> !b.isCancelled()).count());
                    });
                    return entry;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("topCustomers", top);
        return result;
    }

    @Override
    @Transactional
    public BookingDTO upgradeRoom(int bookingId) {
        Booking booking = br.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
        if (booking.isCancelled())
            throw new RuntimeException("Cannot upgrade a cancelled booking!");

        String currentType = booking.getRoom().getType();
        String upgradeType = switch (currentType) {
            case "SINGLE" -> "DOUBLE";
            case "DOUBLE" -> "SUITE";
            default -> throw new RuntimeException("Already in the best room type!");
        };

        List<Room> candidates = rr.findByType(upgradeType);
        Room upgradeRoom = candidates.stream()
                .filter(r -> br.findByCancelledFalse().stream().noneMatch(b ->
                        b.getId() != bookingId &&
                        b.getRoom().getId() == r.getId() &&
                        b.getCheckIn().isBefore(booking.getCheckOut()) &&
                        b.getCheckOut().isAfter(booking.getCheckIn())))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No " + upgradeType + " rooms available for these dates!"));

        booking.setRoom(upgradeRoom);
        booking.setTotalPrice(calculatePrice(upgradeRoom, booking.getCheckIn(), booking.getCheckOut(), booking.getCustomer().getId()));
        br.save(booking);
        return toDTO(booking);
    }

    @Override
    public Map<String, Object> getBookingStats() {
        List<Booking> all = br.findAll();
        List<Booking> active = br.findByCancelledFalse();
        long cancelled = all.stream().filter(Booking::isCancelled).count();

        double revenue = active.stream().mapToDouble(Booking::getTotalPrice).sum();
        double avgNights = active.stream()
                .mapToLong(b -> ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut()))
                .average().orElse(0);
        Map<String, Long> byType = active.stream()
                .collect(Collectors.groupingBy(b -> b.getRoom().getType(), Collectors.counting()));

        long checkInsToday = active.stream().filter(b -> b.getCheckIn().equals(LocalDate.now())).count();
        long checkOutsToday = active.stream().filter(b -> b.getCheckOut().equals(LocalDate.now())).count();
        int totalGuests = active.stream().mapToInt(Booking::getGuestsCount).sum();

        Optional<Map.Entry<Integer, Long>> topRoom = active.stream()
                .collect(Collectors.groupingBy(b -> b.getRoom().getId(), Collectors.counting()))
                .entrySet().stream().max(Map.Entry.comparingByValue());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBookings", all.size());
        stats.put("activeBookings", active.size());
        stats.put("cancelledBookings", cancelled);
        stats.put("totalRevenue", Math.round(revenue * 100.0) / 100.0);
        stats.put("bookingsByRoomType", byType);
        stats.put("averageNights", Math.round(avgNights * 10.0) / 10.0);
        stats.put("checkInsToday", checkInsToday);
        stats.put("checkOutsToday", checkOutsToday);
        stats.put("totalGuests", totalGuests);
        topRoom.ifPresent(e -> rr.findById(e.getKey())
                .ifPresent(r -> stats.put("mostBookedRoom", r.getRoomNumber())));
        return stats;
    }

    private static final String[] MONTH_NAMES = {"","ינו","פבר","מרץ","אפר","מאי","יוני","יולי","אוג","ספט","אוק","נוב","דצמ"};
    private static final String[] MONTH_NAMES_FULL = {"","ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"};

    // ─── תפוסה לפי חודש בשנה נתונה ───
    @Override
    public List<Map<String, Object>> getOccupancyByMonth(int year) {
        List<Room> allRooms = rr.findAll();
        int totalRooms = allRooms.size();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            final int month = m;
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            int daysInMonth = start.lengthOfMonth();

            long occupiedDays = br.findByCancelledFalse().stream()
                    .mapToLong(b -> {
                        LocalDate s = b.getCheckIn().isAfter(start) ? b.getCheckIn() : start;
                        LocalDate e2 = b.getCheckOut().isBefore(end) ? b.getCheckOut() : end;
                        return Math.max(0, ChronoUnit.DAYS.between(s, e2));
                    }).sum();

            double occupancyRate = totalRooms > 0
                    ? Math.round((occupiedDays * 100.0) / (totalRooms * daysInMonth) * 10) / 10.0
                    : 0;

            double revenue = br.findByCancelledFalse().stream()
                    .filter(b -> b.getCheckIn().getYear() == year && b.getCheckIn().getMonth().getValue() == month)
                    .mapToDouble(Booking::getTotalPrice).sum();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", MONTH_NAMES[month]);
            entry.put("monthFull", MONTH_NAMES_FULL[month]);
            entry.put("monthNum", month);
            entry.put("occupancyRate", occupancyRate);
            entry.put("revenue", Math.round(revenue * 100.0) / 100.0);
            entry.put("bookings", br.findAll().stream()
                    .filter(b -> b.getCheckIn().getYear() == year && b.getCheckIn().getMonth().getValue() == month && !b.isCancelled())
                    .count());
            result.add(entry);
        }
        return result;
    }

    // ─── הכנסה יומית ב-N ימים אחרונים ───
    @Override
    public List<Map<String, Object>> getDailyRevenue(int days) {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            double revenue = br.findByCancelledFalse().stream()
                    .filter(b -> !b.getCheckIn().isAfter(date) && b.getCheckOut().isAfter(date))
                    .mapToDouble(b -> b.getTotalPrice() / ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut()))
                    .sum();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date.toString());
            entry.put("day", date.getDayOfMonth());
            entry.put("revenue", Math.round(revenue * 100.0) / 100.0);
            result.add(entry);
        }
        return result;
    }

    // ─── סטטיסטיקות לחדר ספציפי ───
    @Override
    public Map<String, Object> getRoomStats(int roomId) {
        Room room = rr.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found!"));
        List<Booking> roomBookings = br.findAll().stream()
                .filter(b -> b.getRoom().getId() == roomId)
                .collect(Collectors.toList());
        List<Booking> active = roomBookings.stream().filter(b -> !b.isCancelled()).collect(Collectors.toList());

        double totalRevenue = active.stream().mapToDouble(Booking::getTotalPrice).sum();
        double avgNights = active.stream()
                .mapToLong(b -> ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut()))
                .average().orElse(0);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("roomId", roomId);
        stats.put("roomNumber", room.getRoomNumber());
        stats.put("type", room.getType());
        stats.put("totalBookings", roomBookings.size());
        stats.put("activeBookings", active.size());
        stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        stats.put("averageNights", Math.round(avgNights * 10.0) / 10.0);
        return stats;
    }

    private BookingDTO toDTO(Booking b) {
        BookingDTO dto = new BookingDTO();
        dto.setId(b.getId());
        dto.setCustomerId(b.getCustomer().getId());
        dto.setCustomerName(b.getCustomer().getFullName());
        dto.setCustomerEmail(b.getCustomer().getEmail());
        dto.setCustomerPhone(b.getCustomer().getPhone());
        dto.setRoomId(b.getRoom().getId());
        dto.setRoomNumber(b.getRoom().getRoomNumber());
        dto.setRoomType(b.getRoom().getType());
        dto.setRoomFloor(b.getRoom().getFloor());
        dto.setCheckIn(b.getCheckIn());
        dto.setCheckOut(b.getCheckOut());
        dto.setCancelled(b.isCancelled());
        dto.setTotalPrice(b.getTotalPrice() > 0 ? b.getTotalPrice()
                : calculatePrice(b.getRoom(), b.getCheckIn(), b.getCheckOut(), b.getCustomer().getId()));
        dto.setGuestsCount(b.getGuestsCount());
        dto.setNotes(b.getNotes());
        dto.setNights(ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut()));
        String tier = getVipTier(b.getCustomer().getId());
        dto.setVip(!tier.equals("NONE"));
        dto.setVipTier(tier);
        return dto;
    }
}
