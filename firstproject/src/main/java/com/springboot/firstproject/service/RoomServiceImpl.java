package com.springboot.firstproject.service;

import com.springboot.firstproject.dto.RoomDTO;
import com.springboot.firstproject.entity.Room;
import com.springboot.firstproject.repository.RoomRepository;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.lang.reflect.Type;
import java.time.LocalDate;
import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepository rr;

    @Autowired
    private ModelMapper mapper;

    @Override
    public void add(RoomDTO room) {
        Room r = mapper.map(room, Room.class);
        r.setId(0);
        rr.save(r);
    }

    @Override
    public void update(RoomDTO room) {
        if (!rr.existsById(room.getId()))
            throw new RuntimeException("Room not found!");
        rr.save(mapper.map(room, Room.class));
    }

    @Override
    public void delete(int id) {
        rr.deleteById(id);
    }

    @Override
    public List<RoomDTO> getAll() {
        Type listType = new TypeToken<List<RoomDTO>>() {}.getType();
        return mapper.map(rr.findAll(), listType);
    }

    @Override
    public RoomDTO getById(int id) {
        return mapper.map(rr.findById(id).orElseThrow(), RoomDTO.class);
    }

    @Override
    public List<RoomDTO> getByType(String type) {
        Type listType = new TypeToken<List<RoomDTO>>() {}.getType();
        return mapper.map(rr.findByType(type), listType);
    }

    // פונקציה מעניינת #1 - חדרים פנויים לפי תאריכים
    @Override
    public List<RoomDTO> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        if (!checkIn.isBefore(checkOut))
            throw new RuntimeException("Check-in must be before check-out!");
        Type listType = new TypeToken<List<RoomDTO>>() {}.getType();
        return mapper.map(rr.findAvailableRooms(checkIn, checkOut), listType);
    }
}
