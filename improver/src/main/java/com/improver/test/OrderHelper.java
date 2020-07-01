package com.improver.test;

import com.improver.entity.Location;
import com.improver.model.in.Order;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import static com.improver.model.in.Order.BaseLeadInfo.StartExpectation.*;

public class OrderHelper {

    private static List<List<Order.QuestionAnswer>> answers = new ArrayList<>();
    private static List<Order.BaseLeadInfo> details = new ArrayList<>();

    static {
        details.add(new Order.BaseLeadInfo().setState("MO")
            .setCity("St.Louis")
            .setStreetAddress("231 S. Bemiston Ave.")
            .setZip("07059")
            .setNotes("I need high quality")
            .setStartExpectation(FLEXIBLE.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("07002")
            .setNotes("must bee cheep")
            .setStartExpectation(IN_MONTH.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("07456")
            .setNotes("must bee cheep")
            .setStartExpectation(IN_MONTH.toString()));

        details.add(new Order.BaseLeadInfo().setState("WA")
            .setCity("Seattle")
            .setStreetAddress("100 Main st")
            .setZip("07003")
            .setNotes("For an efficient layout, start by marking the center point of each of the walls in the room. Next, snap chalk lines between the center points of opposite walls to pinpoint the center of the room. Make any necessary adjustments to ensure that the intersection creates perfect squares.\n" +
                "\n" + "\n" + "\n" + "\n" +
                "Starting at the center point, lay a row of loose tiles along the center lines in both directions, using tile spacers as you go for even, uniform joints. Once you reach the walls, you'll need to cut tiles for a proper fit. If the cuts needed are smaller than half of a tile, you can adjust the center line by snapping a new line a half-tile size closer to the wall. If necessary, repeat this step along the intersecting center line for a precise design.\n" +
                "\n" +
                "To make a large room more manageable, divide each section into smaller 2' x 3' grids by snapping additional lines parallel to the centerlines." +
                "\n" + "\n" + "\n" + "\n")
            .setStartExpectation(IN_WEEK.toString()));

        details.add(new Order.BaseLeadInfo().setState("AZ")
            .setCity("Tucson")
            .setStreetAddress("799 E Dragram")
            .setZip("10965")
            .setNotes("")
            .setStartExpectation(FLEXIBLE.toString()));

        details.add(new Order.BaseLeadInfo().setState("AZ")
            .setCity("Phoenix")
            .setStreetAddress("200 E Main st")
            .setZip("07010")
            .setNotes("I like movies")
            .setStartExpectation(IN_48_HOURS.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("07054")
            .setNotes("must bee cheep")
            .setStartExpectation(IN_MONTH.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("07054")
            .setNotes("must bee cheep")
            .setStartExpectation(IN_MONTH.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("07960")
            .setNotes("must bee cheep")
            .setStartExpectation(IN_MONTH.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("07960")
            .setNotes("must bee cheep")
            .setStartExpectation(IN_MONTH.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("08854")
            .setNotes("must bee cheep")
            .setStartExpectation(IN_MONTH.toString()));

        details.add(new Order.BaseLeadInfo().setState("NY")
            .setCity("New York")
            .setStreetAddress("Gates Ave 26")
            .setZip("10022")
            .setNotes("Hello World!")
            .setStartExpectation(IN_MONTH.toString()));
    }


    static  {
        List<Order.QuestionAnswer> questionary = new ArrayList<>();
        questionary.add(new Order.QuestionAnswer().setName("What kind of work?")
            .setResults(Collections.singletonList("Install")));
        questionary.add(new Order.QuestionAnswer().setName("What kind of tile are you interested in?")
            .setResults(Collections.singletonList("Encaustic")));
        questionary.add(new Order.QuestionAnswer().setName("What quality/price level tile you want to buy?")
            .setResults(Collections.singletonList("High")));
        questionary.add(new Order.QuestionAnswer().setName("What would you like tiled?")
            .setResults(Arrays.asList("Countertop", "Wall", "Floor", "Backsplash", "Island")));
        questionary.add(new Order.QuestionAnswer().setName("Approximately how many square feet is the area that needs tiling?")
            .setResults(Collections.singletonList("2800")));
        questionary.add(new Order.QuestionAnswer().setName("Does the area to be tiled need to be stripped of any existing surface material?")
            .setResults(Collections.singletonList("Yes, existing tile needs to be removed")));
        questionary.add(new Order.QuestionAnswer().setName("What material will the tile be installed over?")
            .setResults(Collections.singletonList("Wood")));
        answers.add(questionary);
    }

    static  {
        List<Order.QuestionAnswer> questionary = new ArrayList<>();
        questionary.add(new Order.QuestionAnswer().setName("Why are you remodeling your attic?")
            .setResults(Collections.singletonList("Update the attic's look")));
        questionary.add(new Order.QuestionAnswer().setName("What attic rooms will you be adding or replacing?")
            .setResults(Arrays.asList("Bedroom(s)", "Storage", "Bathroom(s)")));

        answers.add(questionary);
    }


    public static Order generateFor(String serviceType) {
        List<Order.QuestionAnswer> details = (new Random().nextBoolean()) ? OrderHelper.answers.get(new Random().nextInt(answers.size()))
            : new ArrayList<>();

        return new Order().setBaseLeadInfo(getRandomDetails()).setQuestionary(details);
    }


    private static Order.BaseLeadInfo getRandomDetails() {
        return details.get(new Random().nextInt(details.size()));

    }

    public static Location getRandomLocation() {
        return details.get(new Random().nextInt(details.size())).getLocation();

    }



}
