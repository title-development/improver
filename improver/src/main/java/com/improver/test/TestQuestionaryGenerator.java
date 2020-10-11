package com.improver.test;


import com.improver.entity.Question;
import com.improver.entity.Questionary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static com.improver.test.TestDataInitializer.PATH_IMGS_SERVICE_TILING;

@Component
public class TestQuestionaryGenerator {

    @Autowired private TestFileUtil testFileUtil;

    @Deprecated
    public Questionary architecturalServices(Questionary questionary) {
        return questionary
            .setName("architecturalServices")
            .setDescription("Questionary for Attic Remodel")
            .addQuestion(new Question()
                .setTitle("Test input question")
                .setLabel("Test input question")
                .setType(Question.Type.TEXT_INPUT))
            .addQuestion(new Question()
                .setTitle("Test textarea question")
                .setLabel("Test textarea question")
                .setType(Question.Type.TEXT_AREA))
            .addQuestion(new Question()
                .setTitle("Test numeric input question")
                .setLabel("Test numeric input question")
                .setType(Question.Type.NUMERIC_INPUT))
            .addQuestion(new Question()
                .setTitle("Test radio button?")
                .setType(Question.Type.RADIO_BUTTON)
                .addAnswer("Answer 1")
                .addAnswer("Answer 2")
                .addAnswer("Answer 3")
                .addAnswer("Answer 4"))
            .addQuestion(new Question()
                .setTitle("Test img radio button?")
                .setType(Question.Type.IMG_RADIO_BUTTON)
                .addAnswer("Answer 1")
                .addAnswer("Answer 2")
                .addAnswer("Answer 3")
                .addAnswer("Answer 4"))
            .addQuestion(new Question()
                .setTitle("Test checkbox button?")
                .setType(Question.Type.CHECK_BOX)
                .addAnswer("Answer 1")
                .addAnswer("Answer 2")
                .addAnswer("Answer 3")
                .addAnswer("Answer 4"))
            .addQuestion(new Question()
                .setTitle("Test img checkbox button?")
                .setType(Question.Type.IMG_CHECK_BOX)
                .addAnswer("Answer 1")
                .addAnswer("Answer 2")
                .addAnswer("Answer 3")
                .addAnswer("Answer 4"));
    }

    public Questionary kitchenTilingQuestionary(Questionary questionary) {
        return questionary
            .setName("kitchenTilingQuestionary")
            .setDescription("Questionary for Kitchen Tiling")
            .addQuestion(new Question()
                .setTitle("What kind of work?")
                .setType(Question.Type.RADIO_BUTTON)
                .addAnswer("Install")
                .addAnswer("Replace"))
            .addQuestion(new Question()
                .setTitle("What kind of tile are you interested in?")
                .setType(Question.Type.IMG_RADIO_BUTTON)
                .addAnswer("Ceramic", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "1_ceramic_tile.png"))
                .addAnswer("Encaustic", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "2_encaustic_tile.png"))
                .addAnswer("Glass", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "3_glass_tile.jpg"))
                .addAnswer("Granite", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "4_granite_tile.jpg"))
                .addAnswer("Porcelain", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "5_porcelain_tile.jpg"))
                .addAnswer("Saltillo", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "6_saltillo_tile.jpg"))
                .addAnswer("Slate", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "7_slate_tile.jpg"))
                .addAnswer("Terracotta", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "8_terracotta_tile.jpg"))
                .addAnswer("Terrazzo", testFileUtil.saveImage(PATH_IMGS_SERVICE_TILING + "9_terrazzo_tile.jpg")))
            .addQuestion(new Question()
                .setTitle("What quality/price level tile you want to buy?")
                .setType(Question.Type.RADIO_BUTTON)
                .addAnswer("Low")
                .addAnswer("Middle")
                .addAnswer("High"))
            .addQuestion(new Question()
                .setTitle("What would you like tiled?")
                .setType(Question.Type.CHECK_BOX)
                .addAnswer("Countertop")
                .addAnswer("Wall")
                .addAnswer("Floor")
                .addAnswer("Backsplash")
                .addAnswer("Island"))
            .addQuestion(new Question()
                .setTitle("Approximately how many square feet is the area that needs tiling?")
                .setType(Question.Type.NUMERIC_INPUT)
                .setLabel("Approximate square footage of area to tile (sq ft)"))
            .addQuestion(new Question()
                .setTitle("Does the area to be tiled need to be stripped of any existing surface material?")
                .setType(Question.Type.RADIO_BUTTON)
                .addAnswer("Yes, existing tile needs to be removed")
                .addAnswer("Yes, carpet or other non-tile material needs to be removed")
                .addAnswer("No existing material (e.g., tile, carpet) needs to be removed"))
            .addQuestion(new Question()
                .setTitle("What material will the tile be installed over?")
                .setType(Question.Type.RADIO_BUTTON)
                .addAnswer("Concrete")
                .addAnswer("Wood")
                .addAnswer("Drywall")
                .addAnswer("Other"));
    }

    public Questionary bathroomPainting(Questionary questionary) {
        return questionary
            .setName("bathroomPaintingQuestionary")
            .setDescription("Questionary for Bathroom Painting")
            .addQuestion(new Question()
                .setTitle("Dou you need to clean painting surface from old paint?")
                .setType(Question.Type.RADIO_BUTTON)
                .addAnswer("Yes")
                .addAnswer("No"));

    }

}
