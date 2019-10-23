package com.improver.service;

import com.improver.repository.UserSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserSearchService {

    @Autowired private UserSearchRepository userSearchRepository;

    public List<String> getTopSearchesByCustomerId(Long customerId, int listSize) {
        int pageRequestSize = listSize * 5;
        List<String> recentSearches;
        recentSearches = userSearchRepository.findByCustomerId(String.valueOf(customerId), PageRequest.of(0, pageRequestSize))
            .getContent()
            .stream()
            .distinct()
            .limit(listSize)
            .collect(Collectors.toList());

        return recentSearches;
    }

}
