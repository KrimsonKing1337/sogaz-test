import { Combobox, Layout } from '@components';

import { getCountries } from '@utils';

import styles from './Main.module.scss';

const countries = getCountries();

const products = [
  { title: 'Путешествия', description: 'Медицинская помощь и защита багажа в поездке' },
  { title: 'Автомобиль', description: 'Защита автомобиля и помощь в дороге' },
  { title: 'Здоровье', description: 'Консультации врачей и обследования по программе ДМС' },
  { title: 'Имущество', description: 'Защита квартиры, дома и вещей от непредвиденного ущерба' },
];

const ProductGrid = () => {
  return (
    <section className={styles.Example}>
      <h2>
        Страховые продукты
      </h2>

      <p className={styles.ExampleDescription}>
        Карточки перестраиваются по ширине рамки.
        <br />
        Перетащите её правый нижний угол
      </p>

      <div className={styles.Resizable}>
        <Layout minItemWidth="16rem" gap={12}>
          {products.map(({ title, description }) => {
            return (
              <Layout.Item key={title} className={styles.ProductCard}>
                <h3>
                  {title}
                </h3>

                <p>
                  {description}
                </p>
              </Layout.Item>
            );
          })}
        </Layout>
      </div>
    </section>
  );
};

const PolicyGrid = () => {
  return (
    <section className={styles.Example}>
      <h2>
        Оформление полиса
      </h2>

      <p className={styles.ExampleDescription}>
        Данные поездки занимают 8 из 12 колонок, сводка полиса - 4.
        <br />
        Поля внутри основной области размещает вложенная сетка
      </p>

      <Layout columns={12} gap={12}>
        <Layout.Item span={8} className={styles.Card}>
          <h3>
            Данные поездки
          </h3>

          <Layout className={styles.PolicyFields} gap={16}>
            <Layout.Item>
              <p className={styles.FieldHeading}>
                Страны путешествия
              </p>

              <Combobox options={countries} />
            </Layout.Item>

            <Layout.Item>
              <Layout minItemWidth="10rem" gap={12}>
                <Layout.Item>
                  <label className={styles.DateField}>
                    <span>
                      Начало поездки
                    </span>

                    <input type="date" defaultValue="2027-01-01" />
                  </label>
                </Layout.Item>

                <Layout.Item>
                  <label className={styles.DateField}>
                    <span>
                      Конец поездки
                    </span>

                    <input type="date" defaultValue="2027-02-01" />
                  </label>
                </Layout.Item>
              </Layout>
            </Layout.Item>

            <Layout.Item>
              <fieldset className={styles.CoverageOptions}>
                <legend>
                  Дополнительное покрытие
                </legend>

                <label>
                  <input type="checkbox" />

                  <span>
                    Багаж
                  </span>
                </label>

                <label>
                  <input type="checkbox" />

                  <span>
                    Активный отдых
                  </span>
                </label>
              </fieldset>
            </Layout.Item>
          </Layout>
        </Layout.Item>

        <Layout.Item span={4} className={styles.SummaryCard}>
          <h3>
            Сводка полиса
          </h3>

          <div className={styles.Summary}>
            <div>
              <div className={styles.SummaryLabel}>
                Программа
              </div>

              <div className={styles.SummaryValue}>
                Путешествия
              </div>
            </div>

            <div>
              <div className={styles.SummaryLabel}>
                Медицинское покрытие
              </div>

              <div className={styles.SummaryValue}>
                До 50 000 €
              </div>
            </div>

            <div>
              <div className={styles.SummaryLabel}>
                Стоимости
              </div>

              <div className={styles.Price}>
                1 290 ₽
              </div>
            </div>
          </div>
        </Layout.Item>
      </Layout>
    </section>
  );
};

const CoverageGrid = () => {
  return (
    <section className={styles.Example}>
      <h2>
        Полис в поездке
      </h2>

      <p className={styles.ExampleDescription}>
        Карточка покрытия занимает две колонки и две строки.
        <br />
        Документы и поддержка размещаются справа друг под другом
      </p>

      <Layout columns={3} gap={12}>
        <Layout.Item span={2} rowSpan={2} className={styles.CoverageCard}>
          <h3>
            Страховое покрытие
          </h3>

          <p className={styles.CoverageAmount}>
            До 50 000 €
          </p>

          <ul className={styles.Benefits}>
            <li>
              Неотложная медицинская помощь
            </li>

            <li>
              Госпитализация и медицинская транспортировка
            </li>
          </ul>
        </Layout.Item>

        <Layout.Item className={styles.Card}>
          <h3>
            Документы
          </h3>

          <p>
            Полис и памятка путешественника хранятся в личном кабинете
          </p>
        </Layout.Item>

        <Layout.Item className={styles.Card}>
          <h3>
            Поддержка
          </h3>

          <p>
            Помощь в поездке круглосуточно
          </p>
        </Layout.Item>
      </Layout>
    </section>
  );
};

export const Main = () => {
  return (
    <main className={styles.Playground}>
      <h1 className={styles.Title}>
        Страховой сервис
      </h1>

      <Layout gap={20}>
        <ProductGrid />
        <PolicyGrid />
        <CoverageGrid />
      </Layout>
    </main>
  );
};
