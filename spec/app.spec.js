process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiSorted = require('chai-sorted');
const request = require('supertest');

const app = require('../app');
const connection = require('../db/connection');

chai.use(chaiSorted);

const { expect } = chai;

describe('/', () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());

  describe('/api', () => {
    it('GET status:200', async () => {
      const { body } = await request(app)
        .get('/api')
        .expect(200);
      expect(body.ok).to.equal(true);
    });

    describe('/topics', () => {
      it('GET status:200, serves all topics', async () => {
        const { body } = await request(app)
          .get('/api/topics')
          .expect(200);
        expect(body).to.contain.keys('topics');
        expect(body.topics).to.be.an('array');
        expect(body.topics).to.have.length(3);
        expect(body.topics[0]).to.contain.keys('slug', 'description');
      });
      it('INVALID METHOD status:405', async () => {
        const { body } = await request(app)
          .put('/api/topics')
          .expect(405);
        expect(body.msg).to.equal('Method Not Allowed');
      });
    });

    describe('/articles', () => {
      it('GET status:200, serves an array of articles', async () => {
        const { body } = await request(app)
          .get('/api/articles')
          .expect(200);
        expect(body).to.contain.keys('articles');
        expect(body.articles).to.be.an('array');
        expect(body.articles[0]).to.have.keys(
          'article_id',
          'author',
          'comment_count',
          'title',
          'topic',
          'created_at',
          'votes',
        );
      });
      it('GET status:200, article data does not contain body', async () => {
        const { body } = await request(app).get('/api/articles').expect(200);
        expect(body.articles[0]).not.to.contain.keys('body');
      });
      it('GET status:200, articles are sorted descending by date by default', async () => {
        const { body } = await request(app)
          .get('/api/articles')
          .expect(200);
        expect(body.articles).to.be.descendingBy('created_at');
      });
      it('GET status:200, each article has a comment count', async () => {
        const { body } = await request(app)
          .get('/api/articles')
          .expect(200);
        expect(body.articles[0].comment_count).to.equal('13');
        expect(body.articles[1].comment_count).to.equal('0');
      });
      it('GET status:200, accepts a sort_by query to sort articles', async () => {
        const { body } = await request(app)
          .get('/api/articles?sort_by=title')
          .expect(200);
        expect(body.articles).to.be.descendingBy('title');
      });
      it('GET status:400, when passed an invalid sort_by query', async () => {
        const { body } = await request(app)
          .get('/api/articles?sort_by=not-a-column')
          .expect(400);
        expect(body.msg).to.equal('Bad Request');
      });
      it('GET status:200, accepts an order query (asc / desc)', async () => {
        const { body } = await request(app)
          .get('/api/articles?order=asc')
          .expect(200);
        expect(body.articles).to.be.ascendingBy('created_at');
      });
      it('GET status:400, when passed an invalid order query', async () => {
        const { body } = await request(app)
          .get('/api/articles?order=not-asc-or-desc')
          .expect(400);
        expect(body.msg).to.equal('Bad Request: Invalid order query');
      });
      it('GET status:200, accepts an author query', async () => {
        const { body } = await request(app)
          .get('/api/articles?author=butter_bridge')
          .expect(200);
        expect(body.articles).to.satisfy(articles => {
          return articles.every(({ author }) => author === 'butter_bridge');
        });
      });
      it('GET status:200, when passed an author that exists, but has no articles', async () => {
        const { body } = await request(app)
          .get('/api/articles?author=lurker')
          .expect(200);
        expect(body.articles).to.eql([]);
      });
      it('GET status:400, when passed an invalid order query', async () => {
        const { body } = await request(app)
          .get('/api/articles?order=not-asc-or-desc')
          .expect(400);
        expect(body.msg).to.equal('Bad Request: Invalid order query');
      });
      it('GET status:200, accepts an author query', async () => {
        const { body } = await request(app)
          .get('/api/articles?author=butter_bridge')
          .expect(200);
        expect(body.articles).to.satisfy(articles => {
          return articles.every(({ author }) => author === 'butter_bridge');
        });
      });
      it('GET status:200, when passed an author that exists, but has no articles', async () => {
        const { body } = await request(app)
          .get('/api/articles?author=lurker')
          .expect(200);
        expect(body.articles).to.eql([]);
      });
      it('GET status:404, when passed an author that does not exist', async () => {
        const { body } = await request(app)
          .get('/api/articles?author=not-an-author')
          .expect(404);
        expect(body.msg).to.equal('User Not Found');
      });
      it('GET status:200, accepts a topic query', async () => {
        const { body } = await request(app)
          .get('/api/articles?topic=cats')
          .expect(200);
        expect(body.articles).to.satisfy(articles => {
          return articles.every(({ topic }) => topic === 'cats');
        });
      });
      it('GET status:200, when passed a topic that exists, but has no articles', async () => {
        const { body } = await request(app)
          .get('/api/articles?topic=paper')
          .expect(200);
        expect(body.articles).to.eql([]);
      });
      it('GET status:404, when passed an topic that does not exist', async () => {
        const { body } = await request(app)
          .get('/api/articles?topic=not-a-topic')
          .expect(404);
        expect(body.msg).to.equal('Topic Not Found');
      });
      it('POST status: 201', async () => {
        const articleToPost = {
          username: 'rogersop',
          title: 'new title',
          body: 'new article',
          topic: 'mitch',
        };
        const { body } = await request(app)
          .post('/api/articles')
          .send(articleToPost)
          .expect(201);
        expect(body.article).to.have.keys(
          'article_id',
          'body',
          'author',
          'topic',
          'created_at',
          'votes',
          'title'
        );
        expect(body.article.author).to.equal(articleToPost.username);
        expect(body.article.title).to.equal(articleToPost.title);
        expect(body.article.topic).to.equal(articleToPost.topic);
        expect(body.article.votes).to.equal(0);
      });
      it('POST status: 400, when posted article is missing properties', async () => {
        const articleToPost = { username: 'rogersop' };
        const { body } = await request(app)
          .post('/api/articles')
          .send(articleToPost)
          .expect(400);
        expect(body.msg).to.equal('Bad Request');
      });
      it('POST status: 404, when posting an article for a non-existant author ', async () => {
        const articleToPost = {
          username: 'douglashellowell',
          title: 'new title',
          body: 'new article',
          topic: 'mitch',
        };
        const { body } = await request(app)
          .post('/api/articles')
          .send(articleToPost)
          .expect(404);
        expect(body.msg).to.equal('Not Found');
      });
      it('POST status: 404, when posting an article for a non-existant topic ', async () => {
        const articleToPost = {
          username: 'rogersop',
          title: 'new title',
          body: 'new article',
          topic: 'supersmashbros',
        };
        const { body } = await request(app)
          .post('/api/articles')
          .send(articleToPost)
          .expect(404);
        expect(body.msg).to.equal('Not Found');
      });
      it('DELETE status:204, deletes an article', async () => {
        await request(app).delete('/api/articles/1').expect(204);
        await request(app).get('/api/articles/1').expect(404);
      });
      it('DELETE status:204, deletes all comments associated with deleted article', async () => {
        await request(app).get('/api/articles/1/comments').expect(200);
        await request(app).delete('/api/articles/1').expect(204);
        await request(app).get('/api/articles/1/comments').expect(404);
      });
      it('DELETE status:404, when passed article_id that doesnt exist', async () => {
        await request(app).delete('/api/articles/9999').expect(404)
      });
      it('DELETE status:400, when passed an invalid article_id', async () => {
        await request(app).delete('/api/articles/onetwothree').expect(400)
      });
      it('INVALID METHOD status:405', async () => {
        const { body } = await request(app)
          .put('/api/articles')
          .expect(405);
        expect(body.msg).to.equal('Method Not Allowed');
      });

      describe('/:article_id', () => {
        it('GET status:200, serves up an article by id', async () => {
          const { body } = await request(app)
            .get('/api/articles/2')
            .expect(200);
          expect(body).to.contain.keys('article');
          expect(body.article).to.be.an('object');
          expect(body.article).to.contain.keys(
            'article_id',
            'author',
            'title',
            'topic',
            'created_at',
            'votes',
          );
          expect(body.article.article_id).to.equal(2);
        });
        it('GET status:200, serves up an article with corresponding comment_count', async () => {
          const { body } = await request(app)
            .get('/api/articles/2')
            .expect(200);
          expect(body.article.comment_count).to.equal('0');
        });
        it('GET status:404, when passed a valid non-existent article_id', async () => {
          const { body } = await request(app)
            .get('/api/articles/9999')
            .expect(404);
          expect(body.msg).to.equal('article_id not found');
        });
        it('GET status:404, when passed a valid non-existent article_id', async () => {
          const { body } = await request(app)
            .get('/api/articles/not-a-valid-id')
            .expect(400);
          expect(body.msg).to.equal('Bad Request');
        });
        it('INVALID METHOD status:405', async () => {
          const { body } = await request(app)
            .put('/api/articles/1')
            .expect(405);
          expect(body.msg).to.equal('Method Not Allowed');
        });

        it('PATCH status:200, increments the votes when passed inc_votes value of 1', async () => {
          const { body } = await request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 1 })
            .expect(200);
          expect(body.article.votes).to.equal(101);
        });
        it('PATCH status:200, increments the votes when passed inc_votes value', async () => {
          const { body } = await request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 2 })
            .expect(200);
          expect(body.article.votes).to.equal(102);
        });
        it('PATCH status:200, increments the votes when passed a negative inc_votes value', async () => {
          const { body } = await request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: -2 })
            .expect(200);
          expect(body.article.votes).to.equal(98);
        });
        it('PATCH status:200, votes do not change when not passed an inc_votes value', async () => {
          const { body } = await request(app)
            .patch('/api/articles/1')
            .send({})
            .expect(200);
          expect(body.article.votes).to.equal(100);
        });
        it('PATCH status:200, votes changes persist', async () => {
          await request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: -5 })
            .expect(200);
          const { body } = await request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: -1 })
            .expect(200);
          expect(body.article.votes).to.equal(94);
        });
        it('PATCH status:400, when passed an invalid inc_votes property', async () => {
          const { body } = await request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 'not a number' })
            .expect(400);
          expect(body.msg).to.equal('Bad Request');
        });

        describe('/comments', () => {
          it('GET status:200, serves an array of all comments belonging to an article', async () => {
            const { body } = await request(app)
              .get('/api/articles/1/comments')
              .expect(200);
            expect(body).to.contain.keys('comments');
            expect(body.comments).to.be.an('array');
            expect(body.comments[0]).to.contain.keys(
              'comment_id',
              'body',
              'article_id',
              'author',
              'votes',
              'created_at',
            );
            expect(body.comments).to.satisfy(comments => {
              return comments.every(({ article_id }) => {
                return article_id === 1;
              });
            });
          });
          it('GET status:404, when passed a valid non-existent article_id', async () => {
            const { body } = await request(app)
              .get('/api/articles/1000/comments')
              .expect(404);
            expect(body.msg).to.equal('Article Not Found');
          });
          it('GET status:200, serves an empty array when article has no comments', async () => {
            const { body } = await request(app)
              .get('/api/articles/2/comments')
              .expect(200);
            expect(body.comments).to.eql([]);
          });
          it('GET status:200, comments are sorted by date created by default', async () => {
            const { body } = await request(app)
              .get('/api/articles/1/comments')
              .expect(200);
            expect(body.comments).to.be.descendingBy('created_at');
          });
          it('GET status:200, accepts a sort_by query', async () => {
            const { body } = await request(app)
              .get('/api/articles/1/comments?sort_by=body')
              .expect(200);
            expect(body.comments).to.be.descendingBy('body');
          });
          it('GET status:400, for invalid sort_by query', async () => {
            const { body } = await request(app)
              .get('/api/articles/1/comments?sort_by=not-a-column')
              .expect(400);
            expect(body.msg).to.equal('Bad Request');
          });
          it('GET status:200, accepts an order query', async () => {
            const { body } = await request(app)
              .get('/api/articles/1/comments?order=asc')
              .expect(200);
            expect(body.comments).to.be.ascendingBy('created_at');
          });
          it('GET status:400, for invalid order query', async () => {
            const { body } = await request(app)
              .get('/api/articles/1/comments?order=not-asc-or-desc')
              .expect(400);
            expect(body.msg).to.equal('Bad Request: Invalid order query');
          });

          it('POST status:201, returns new comment when passed a valid comment', async () => {
            const commentToPost = { body: 'new comment', username: 'rogersop' };
            const { body } = await request(app)
              .post('/api/articles/2/comments')
              .send(commentToPost)
              .expect(201);
            expect(body.comment).to.contain.keys(
              'comment_id',
              'body',
              'author',
              'created_at',
              'votes',
              'article_id',
            );
            expect(body.comment.body).to.equal(commentToPost.body);
            expect(body.comment.author).to.equal(commentToPost.username);
            expect(body.comment.votes).to.equal(0);
            expect(body.comment.article_id).to.equal(2);
          });
          it('POST status:400, when posted comment is missing properties', async () => {
            const commentToPost = { username: 'rogersop' };
            const { body } = await request(app)
              .post('/api/articles/2/comments')
              .send(commentToPost)
              .expect(400);
            expect(body.msg).to.equal('Bad Request');
          });
          it('POST status:404, when given a non-existent article_id', async () => {
            const commentToPost = { body: 'new comment', username: 'rogersop' };
            const { body } = await request(app)
              .post('/api/articles/1000/comments')
              .send(commentToPost)
              .expect(404);
            expect(body.msg).to.equal('Not Found');
          });

          it('INVALID METHOD status:405', async () => {
            const { body } = await request(app)
              .put('/api/articles/1/comments')
              .expect(405);
            expect(body.msg).to.equal('Method Not Allowed');
          });
        });
      });
    });

    describe('/comments', () => {
      describe('/:comment_id', () => {
        it('PATCH status:200, increments votes when passed a inc_vote property', async () => {
          const { body } = await request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 1 })
            .expect(200);
          expect(body.comment.votes).to.equal(17);
        });
        it('PATCH status:200, votes stay the same when not sent inc_votes property', async () => {
          const { body } = await request(app)
            .patch('/api/comments/1')
            .send({})
            .expect(200);
          expect(body.comment.votes).to.equal(16);
        });
        it('PATCH status:200, votes are persistent', async () => {
          await request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 10 })
            .expect(200);
          const { body } = await request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 1 })
            .expect(200);
          expect(body.comment.votes).to.equal(27);
        });
        it('PATCH status:400, when sent an invalid inc_votes property', async () => {
          const { body } = await request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 'not a number' })
            .expect(400);
          expect(body.msg).to.equal('Bad Request');
        });
        it('PATCH status:404, when sent an valid non-existent comment_id', async () => {
          const { body } = await request(app)
            .patch('/api/comments/1000')
            .send({ inc_votes: 1 })
            .expect(404);
          expect(body.msg).to.equal('comment not found');
        });
        it('PATCH status:400, when sent an invalid comment_id', async () => {
          const { body } = await request(app)
            .patch('/api/comments/not-an-id')
            .send({ inc_votes: 1 })
            .expect(400);
          expect(body.msg).to.equal('Bad Request');
        });

        it('DELETE status:204, deletes a comment', () => {
          return request(app)
            .delete('/api/comments/1')
            .expect(204);
        });
        it('DELETE status:404, when passed valid id that does not exist', async () => {
          const { body } = await request(app)
            .delete('/api/comments/1000')
            .expect(404);
          expect(body.msg).to.equal('comment not found');
        });
        it('DELETE status:400, when passed an invalid id', async () => {
          const { body } = await request(app)
            .delete('/api/comments/not-an-id')
            .expect(400);
          expect(body.msg).to.equal('Bad Request');
        });

        it('INVALID METHOD status:405', async () => {
          const { body } = await request(app)
            .put('/api/comments/1')
            .expect(405);
          expect(body.msg).to.equal('Method Not Allowed');
        });
      });
    });

    describe('/users', () => {
      it('GET status:200, serves an array of users', async () => {
        const {body} = await request(app).get('/api/users').expect(200)
        expect(body).to.have.keys('users');
        expect(body.users).to.be.an('array')
        expect(body.users[0]).to.have.keys('username', 'name', 'avatar_url')
      });
      it('INVALID METHOD status:405', async() => {
        const {body} = await request(app).put('/api/users').expect(405)
        expect(body.msg).to.equal('Method Not Allowed')
      })
      describe('/:username', () => {
        it('GET status:200, serves up correct user', async () => {
          const { body } = await request(app)
            .get('/api/users/rogersop')
            .expect(200);
          expect(body).to.contain.keys('user');
          expect(body.user).to.contain.keys('username', 'avatar_url', 'name');
          expect(body.user.username).to.equal('rogersop');
        });
        it('GET status:404, when passed a valid username that does not exist', async () => {
          const { body } = await request(app)
            .get('/api/users/not-a-user')
            .expect(404);
          expect(body.msg).to.equal('user not found');
        });

        it('INVALID METHOD status:405', async () => {
          const { body } = await request(app)
            .put('/api/users/rogersop')
            .expect(405);
          expect(body.msg).to.equal('Method Not Allowed');
        });
      });
    });
  });
});
