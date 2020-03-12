package com.improver.test;

import com.improver.entity.ProjectRequest;
import com.improver.entity.ProjectMessage;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class RandomChatGenerator {

    private static String HI_MSG = "Hi we are best PRO ever! We would like to discuss more detail on this project. Please give us call, or contact me in this chat.\nThank you";

    private static List<String> messages = Arrays.asList(
        "Let’s suppose that you were able every night to dream any dream you wanted to dream, and that you could for example have the power within one night to dream 75 years of time, or any length of time you wanted to have.",

        "And you would, naturally, as you began on this adventure of dreams, you would fulfill all your wishes. You would have every kind of pleasure during your sleep.",

        "And after several nights of 75 years of total pleasure each you would say “Well that was pretty great”. But now let’s have a surprise, let’s have a dream which isn’t under control, where something is gonna happen to me that I don’t know what it's gonna be.",

        "And you would dig that and would come out of that and you would say “Wow that was a close shave, wasn’t it?”. Then you would get more and more adventurous and you would make further- and further-out gambles what you would dream.",

        "And finally, you would dream where you are now. You would dream the dream of living the life that you are actually living today.",

        "If you awaken from this illusion and you understand that black implies white, self implies other, life implies death (or shall I say death implies life?), " +
            "you can feel yourself – not as a stranger in the world, not as something here on probation, not as something that has arrived here by fluke - but you can begin to feel your own existence as absolutely fundamental.",

        "Я слаб, я не могу бороться, я не могу заманивать других в ловушку, чтобы выжить." +
            "\nЯ слаб, но мне стыдно пасть так низко, чтобы резать других, а самому выжить." +
            "\nЯ слаб, но мне стыдно пасть так низко, чтобы чужие слова выдавать за свои." +
            "\nЯ слаб, и я буду беречь свою слабость.",

        "Я рисовал с натуры листья деревьев\n" +
            " и был поражен красотой прожилок.\n" +
            " Мне хотелось срисовать их красоту.\n",

        "Поздно ночью\n" +
            " деревья собираются в дорогу,\n" +
            " в тайном сговоре\n" +
            " долго-долго собираются в дорогу,\n" +
            " почти каждую ночь собираются в дорогу,\n" +
            " крепко врастая корнями в землю.\n" +
            " Куда они пойдут?\n" +
            " Не знают и не желают знать.\n" +
            " Уйти - желание всей их жизни.\n" +
            " И этой ночью\n" +
            " деревья собираются в дорогу,\n" +
            " Тайно, с дрожью в руках, собираются в дорогу.",

        "Could you please invite my mom to watch movie?",

        "When can we start work on this project",

        "I've heard a lot of interesting stuff about new way interfacial intelligence approach",

        "Your work sucks, Java is the best!!!",
        ") so funny",

        "The only thing in life achieved without effort is failure",

        "Success is not in what you have, but who you are",

        "A banker is a fellow who lends you his umbrella when the sun is shining, but wants it back the minute it begins to rain"

    );


    public static List<ProjectMessage> generate(ProjectRequest projectRequest, String sender, String receiver, ZonedDateTime till) {
        List<ProjectMessage> conversation = new ArrayList<>();
        conversation.add(new ProjectMessage()
            .setProjectRequest(projectRequest)
            .setSender(sender)
            .setBody(HI_MSG)
            .setCreated(projectRequest.getCreated().plusSeconds(1)));

        int bound = new Random().nextInt(messages.size());
        List<ProjectMessage> random = IntStream.range(0, bound)
            .filter(i -> bound % (i+1) == 0)
            .mapToObj(i -> new ProjectMessage().setProjectRequest(projectRequest)
                .setSender(i % 2 == 0 ? receiver : sender)
                .setBody(messages.get(i))
                .setCreated(TestDateUtil.randomDateBetween(projectRequest.getCreated(), till)))
            .sorted(Comparator.comparing(ProjectMessage::getCreated))
            .collect(Collectors.toList());
        conversation.addAll(random);
        return conversation;
    }

}
