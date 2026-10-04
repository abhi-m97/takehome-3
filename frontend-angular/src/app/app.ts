import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { CourseProgress, LearnerProgressResponse } from './types';

const LEARNER_ID = 1;

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  readonly learnerId = LEARNER_ID;
  courses: CourseProgress[] | null = null;

  ngOnInit(): void {
    this.http
      .get<LearnerProgressResponse>(`/api/learners/${this.learnerId}/progress`)
      .subscribe((body) => {
        this.courses = body.courses;
      });
  }
}
