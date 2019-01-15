package com.improver.util.tracking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Data
@Accessors(chain = true)
@AllArgsConstructor
@NoArgsConstructor
public class Visitor {

    private String id;
    private boolean isFirst;
    private List<String> requests;

    public static Visitor ofRequest(HttpServletRequest request){
        return new Visitor().setId(UUID.randomUUID().toString())
            .setRequest(request)
            .setFirst(true);
    }

    public Visitor addRequest(HttpServletRequest request){
        if (requests == null){
            requests = new ArrayList<>();
        }
        requests.add(logRequest(request));
        return this;
    }


    public Visitor setRequest(HttpServletRequest request){
        requests = Collections.singletonList(logRequest(request));
        return this;
    }


    private static String logRequest(HttpServletRequest request){
        return request.getMethod() + " " + request.getRequestURI() + (request.getQueryString() != null ? "?"+ request.getQueryString() : "");
    }
}
