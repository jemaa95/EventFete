import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <p>© {{ year }} EventFete — Tous droits réservés. Copyright by Jemaa Kourda {{ year }}.</p>
    </footer>
  `,
  styles: [`
    .site-footer {
      text-align: center;
      padding: 20px 16px;
      background: #fff;
      border-top: 1px solid #eef0f3;
      color: #94a3b8;
      font-size: 0.8rem;
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
