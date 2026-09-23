package com.springboot.firstproject.dto;

import lombok.Data;

@Data
public class RoomDTO {
    private int id;
    private String roomNumber;
    private String type;
    private double pricePerNight;
    private boolean available;
    private int floor;
    private int maxGuests;
    private String description;
    private String amenities;
}
