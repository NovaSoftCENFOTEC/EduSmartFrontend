import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject,} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    public sidebarOpen: boolean = true;
    private unsubscriber: Subject<any> = new Subject();
    private pageTitle = new BehaviorSubject<string>('');
    public title = this.pageTitle.asObservable();

    constructor() {
        // fromEvent(window, 'resize')
        //   .pipe(debounceTime(100), takeUntil(this.unsubscriber))
        //   .subscribe((event: any) => {
        //     this.sidebarOpen = event.target.innerWidth >= 991;
        //   });
    }

    public setTitle(title: string) {
        this.pageTitle.next(title);
    }

    ngOnDestroy(): void {
        this.unsubscriber.complete();
    }

    public toggleSidebar(): void {
        this.sidebarOpen = !this.sidebarOpen;
    }
}
