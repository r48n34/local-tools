import { Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';

interface DisplayCarouselProps {
    imgsList: string[]
}

function DisplayCarousel({ imgsList }: DisplayCarouselProps) {
    return (
        <>
            <Carousel slideSize="70%" height={500} slideGap="md" withIndicators>
                {imgsList.map((url) => (
                    <Carousel.Slide key={url}>
                        <Image
                            src={url}
                            style={{ borderRadius: "20px", objectFit: "cover" }}
                            alt={"Images"}
                            height={500}
                            width="100%"
                        />
                    </Carousel.Slide>
                ))}
            </Carousel>
        </>
    )
}

export default DisplayCarousel
