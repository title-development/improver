package com.improver.service;

import com.improver.entity.User;
import com.improver.entity.UserTutorial;
import com.improver.repository.UserTutorialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserTutorialService {
    @Autowired UserTutorialRepository userTutorialRepository;

    public List<UserTutorial.Tutorial> getAvailableTutorials(User user) {
        List<UserTutorial.Tutorial> tutorials = new ArrayList<>();
        if (user.getRole().equals(User.Role.CUSTOMER)) {
            tutorials = UserTutorial.Tutorial.getCustomerTutorials();
        } else if (user.getRole().equals(User.Role.CONTRACTOR)) {
            tutorials = UserTutorial.Tutorial.getContractorTutorials();
        }
        List<UserTutorial> completedTutorials = userTutorialRepository.getCompletedTutorials(tutorials, user.getId());
        tutorials = tutorials.stream()
            .filter(tutorial -> completedTutorials.stream()
                .noneMatch(completed -> completed.getTutorial().equalsValue(tutorial.toString())))
            .collect(Collectors.toList());

        return tutorials;
    }

    public void complete(User user, UserTutorial.Tutorial tutorial) {
        UserTutorial newUserTutorial = new UserTutorial(user, tutorial);
        userTutorialRepository.save(newUserTutorial);
    }
}
