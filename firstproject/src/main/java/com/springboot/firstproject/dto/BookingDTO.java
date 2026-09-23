package com.springboot.firstproject.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingDTO {
    private int id;
    private int customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private int roomId;
    private String roomNumber;
    private String roomType;
    private int roomFloor;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private boolean cancelled;
    private double totalPrice;
    private boolean vip;
    private String vipTier;
    private int guestsCount;
    private String notes;
    private long nights;
}
