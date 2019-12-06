package com.itechnews.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "password_reset_token")
@Getter
@Setter
//@ToString //StackOverflowException
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
    public static final int EXPIRATION = 60 * 24;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String token;

    @JsonIgnore
    @OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST})
    @JoinColumn(name = "user_id")
    private User user;

    private Date expiryDate;

    @Override
    public String toString() {
        return "";
    }
}