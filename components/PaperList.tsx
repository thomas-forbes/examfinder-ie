import { Box, Container, Grid, Paper, Typography } from '@mui/material'
import splitbee from '@splitbee/web'

export default function PaperList({ papers }) {
  const createUrl = (type: string, year: string, url: string) => {
    let typeFormatter = {
      'Exam Paper': 'exampapers',
      'Marking Scheme': 'markingschemes',
    }
    return `https://www.examinations.ie/archive/${typeFormatter[type]}/${year}/${url}`
  }
  return (
    <Container>
      <Grid container spacing={5} justifyContent="center">
        {papers.map((paper, i) => (
          <Grid item key={i}>
            <a
              href={createUrl(paper.type, paper.year, paper.url)}
              target="_blank"
              style={{ textDecoration: 'none' }}
              rel="noreferrer"
              onClick={() => splitbee.track('Paper', paper)}
            >
              <Paper elevation={3} sx={{ width: 300 }}>
                <Box
                  sx={{
                    background:
                      paper.type === 'Exam Paper' ? '#2196f3' : '#f50057',
                    paddingX: 2,
                    paddingY: 1,
                    borderRadius: 1,
                  }}
                >
                  <Container disableGutters>
                    <Typography variant="h4">{paper.type}</Typography>
                  </Container>
                </Box>
                <Box sx={{ paddingX: 2, paddingY: 1 }}>
                  <Typography variant="h6">{paper.subject}</Typography>
                  <Typography
                    variant="subtitle1"
                    //sx={{ height: '3.5em' }}
                  >
                    {paper.details}
                  </Typography>
                  <Typography variant="body1">{paper.year}</Typography>
                </Box>
              </Paper>
            </a>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
