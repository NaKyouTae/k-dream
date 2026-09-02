import { Module } from "@nestjs/common";
import {
  CommentsController,
  StudentCommentsController,
} from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
  controllers: [StudentCommentsController, CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
