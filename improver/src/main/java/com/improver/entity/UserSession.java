package com.improver.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;

@Data
@Entity(name = "user_sessions")
@NoArgsConstructor
@Accessors(chain = true)
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "user_sessions_fkey"))
    private User user;

    private String ip;

    private String location;

    private String device;

    private String tokenId;

    private boolean isRefresh;

    private ZonedDateTime timestamp;



    public UserSession(User user, String ip, String location, String device, String tokenId, boolean isRefresh, ZonedDateTime timestamp) {
        this.user = user;
        this.ip = ip;
        this.location = location;
        this.device = device;
        this.tokenId = tokenId;
        this.isRefresh = isRefresh;
        this.timestamp = timestamp;
    }
}
