package com.springboot.firstproject.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
public class Booking {

    @Id
    @GeneratedValue
    private int id;

    @ManyToOne
    private Customer customer;

    @ManyToOne
    private Room room;

    private LocalDate checkIn;
    private LocalDate checkOut;
    private boolean cancelled;
    private int guestsCount;
    private String notes;
    private double totalPrice;
}
