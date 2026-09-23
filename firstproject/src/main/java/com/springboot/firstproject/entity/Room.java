package com.springboot.firstproject.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Room {

    @Id
    @GeneratedValue
    private int id;

    private String roomNumber;
    private String type; // SINGLE, DOUBLE, SUITE
    private double pricePerNight;
    private boolean available;
    private int floor;
    private int maxGuests;
    private String description;
    private String amenities; // comma-separated: "WiFi,TV,Balcony,Jacuzzi"
}
