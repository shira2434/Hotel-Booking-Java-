package com.springboot.firstproject.service;

import com.springboot.firstproject.dto.CustomerDTO;
import com.springboot.firstproject.entity.Customer;
import com.springboot.firstproject.repository.BookingRepository;
import com.springboot.firstproject.repository.CustomerRepository;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired private CustomerRepository cr;
    @Autowired private BookingRepository br;
    @Autowired private ModelMapper mapper;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    private String getVipTier(int customerId) {
        long count = br.findByCustomerId(customerId).stream().filter(b -> !b.isCancelled()).count();
        if (count >= 10) return "GOLD";
        if (count >= 5)  return "SILVER";
        if (count >= 3)  return "BRONZE";
        return "NONE";
    }

    @Override
    public void add(CustomerDTO customer) {
        if (cr.existsById(customer.getId()))
            throw new RuntimeException("Customer already exists!");
        cr.save(mapper.map(customer, Customer.class));
    }

    @Override
    public void update(CustomerDTO customer) {
        if (!cr.existsById(customer.getId()))
            throw new RuntimeException("Customer not found!");
        Customer existing = cr.findById(customer.getId()).orElseThrow();
        existing.setFullName(customer.getFullName());
        existing.setPhone(customer.getPhone());
        existing.setEmail(customer.getEmail());
        cr.save(existing);
    }

    @Override
    public void delete(int id) {
        if (!br.findByCustomerId(id).stream().filter(b -> !b.isCancelled()).collect(Collectors.toList()).isEmpty())
            throw new RuntimeException("Cannot delete customer with active bookings!");
        cr.deleteById(id);
    }

    @Override
    public List<CustomerDTO> getAll() {
        Type listType = new TypeToken<List<CustomerDTO>>() {}.getType();
        return mapper.map(cr.findAll(), listType);
    }

    @Override
    public CustomerDTO getById(int id) {
        return mapper.map(cr.findById(id).orElseThrow(), CustomerDTO.class);
    }

    @Override
    public CustomerDTO getByEmail(String email) {
        return mapper.map(cr.findByEmail(email), CustomerDTO.class);
    }

    @Override
    public CustomerDTO register(CustomerDTO customer) {
        if (cr.findByEmail(customer.getEmail()) != null)
            throw new RuntimeException("Email already registered!");
        customer.setPassword(encoder.encode(customer.getPassword()));
        Customer saved = cr.save(mapper.map(customer, Customer.class));
        return mapper.map(saved, CustomerDTO.class);
    }

    @Override
    public CustomerDTO login(String email, String password) {
        Customer customer = cr.findByEmail(email);
        if (customer == null || !encoder.matches(password, customer.getPassword()))
            throw new RuntimeException("Invalid email or password!");
        return mapper.map(customer, CustomerDTO.class);
    }

    // ─── Full customer profile with stats ───
    @Override
    public Map<String, Object> getCustomerProfile(int id) {
        Customer c = cr.findById(id).orElseThrow(() -> new RuntimeException("Customer not found!"));
        var bookings = br.findByCustomerId(id);
        var active = bookings.stream().filter(b -> !b.isCancelled()).collect(Collectors.toList());

        double totalSpent = active.stream()
                .mapToDouble(b -> {
                    long nights = ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut());
                    return nights * b.getRoom().getPricePerNight();
                }).sum();

        double avgNights = active.stream()
                .mapToLong(b -> ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut()))
                .average().orElse(0);

        Map<String, Long> byType = active.stream()
                .collect(Collectors.groupingBy(b -> b.getRoom().getType(), Collectors.counting()));

        String tier = getVipTier(id);
        long nextTierBookings = switch (tier) {
            case "NONE"   -> 3 - active.size();
            case "BRONZE" -> 5 - active.size();
            case "SILVER" -> 10 - active.size();
            default       -> 0;
        };

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", c.getId());
        profile.put("fullName", c.getFullName());
        profile.put("email", c.getEmail());
        profile.put("phone", c.getPhone());
        profile.put("vipTier", tier);
        profile.put("bookingsToNextTier", Math.max(nextTierBookings, 0));
        profile.put("totalBookings", bookings.size());
        profile.put("activeBookings", active.size());
        profile.put("cancelledBookings", bookings.size() - active.size());
        profile.put("totalSpent", Math.round(totalSpent * 100.0) / 100.0);
        profile.put("averageNights", Math.round(avgNights * 10.0) / 10.0);
        profile.put("bookingsByRoomType", byType);
        return profile;
    }

    // ─── All VIP customers (BRONZE+) ───
    @Override
    public List<CustomerDTO> getVipCustomers() {
        return cr.findAll().stream()
                .filter(c -> !getVipTier(c.getId()).equals("NONE"))
                .map(c -> mapper.map(c, CustomerDTO.class))
                .collect(Collectors.toList());
    }
}
